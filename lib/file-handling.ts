import { toast } from "@/components/ui/toast"
import logger from "./logger"
import { DAILY_FILE_UPLOAD_LIMIT } from "./config"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export type Attachment = {
  name: string
  contentType: string
  url: string
  data?: string  // Base64 encoded file content for backend API
}

export async function validateFile(
  file: File
): Promise<{ isValid: boolean; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not supported",
    }
  }

  return { isValid: true }
}

export async function uploadFile(
  file: File
): Promise<string> {
  // Since Supabase has been removed, create a local object URL for the file
  return URL.createObjectURL(file)
}

export function createAttachment(file: File, url: string): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url,
  }
}

export async function processFiles(
  files: File[],
  chatId: string,
  userId: string
): Promise<Attachment[]> {
  const attachments: Attachment[] = []

  for (const file of files) {
    const validation = await validateFile(file)
    if (!validation.isValid) {
      logger.warn(`File ${file.name} validation failed:`, validation.error)
      toast({
        title: "File validation failed",
        description: validation.error,
        status: "error",
      })
      continue
    }

    try {
      // For images, convert to base64 for sending to backend
      if (file.type.startsWith('image/')) {
        const base64Data = await fileToBase64(file)
        
        // Create attachment with base64 data (for API) and blob URL (for UI)
        attachments.push({
          name: file.name,
          contentType: file.type,
          url: URL.createObjectURL(file), // For UI display
          data: base64Data // For backend API
        })
      } else {
        // For non-images, use original logic
        const url = await uploadFile(file)
        attachments.push(createAttachment(file, url))
      }
    } catch (error) {
      logger.error(`Error processing file ${file.name}:`, error)
    }
  }

  return attachments
}

/**
 * Convert a File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export class FileUploadLimitError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = "DAILY_FILE_LIMIT_REACHED"
  }
}

export async function checkFileUploadLimit(userId: string) {
  // Since Supabase has been removed, file upload limits are not enforced
  // Files are handled locally via object URLs
  return 0
}
