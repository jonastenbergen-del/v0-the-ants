import { useState, useCallback } from 'react'

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

interface UseBlobUploadReturn {
  uploadFile: (file: File) => Promise<string | null>
  deleteFile: (url: string) => Promise<boolean>
  uploadMultiple: (files: File[]) => Promise<string[]>
  state: UploadState
  reset: () => void
}

export function useBlobUpload(): UseBlobUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setState({ isUploading: true, progress: 0, error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setState({ isUploading: false, progress: 100, error: null })
      return data.url
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setState({ isUploading: false, progress: 0, error: errorMessage })
      return null
    }
  }, [])

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      return response.ok
    } catch {
      return false
    }
  }, [])

  const uploadMultiple = useCallback(async (files: File[]): Promise<string[]> => {
    setState({ isUploading: true, progress: 0, error: null })
    const urls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          urls.push(data.url)
        }
      } catch {
        // Continue with next file even if one fails
      }

      setState(prev => ({
        ...prev,
        progress: Math.round(((i + 1) / files.length) * 100),
      }))
    }

    setState({ isUploading: false, progress: 100, error: null })
    return urls
  }, [])

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null })
  }, [])

  return {
    uploadFile,
    deleteFile,
    uploadMultiple,
    state,
    reset,
  }
}
