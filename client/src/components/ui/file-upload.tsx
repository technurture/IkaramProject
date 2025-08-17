import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image, Video, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  onUrlsChange?: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  description?: string;
  value?: string[];
  disabled?: boolean;
}

interface UploadedFile {
  file?: File;
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size?: number;
  uploading?: boolean;
  error?: string;
}

export function FileUpload({
  onFilesChange,
  onUrlsChange,
  accept = "image/*,video/*,.pdf,.doc,.docx",
  multiple = true,
  maxFiles = 10,
  maxSize = 25, // 25MB default
  className,
  label = "Upload Files",
  description = "Upload images, videos, or documents",
  value = [],
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url || result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<Array<{url: string, filename: string, success: boolean}>> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/media/upload-multiple', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.results || [];
    } catch (error) {
      throw new Error('Failed to upload files');
    }
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || disabled) return;

    const newFiles: UploadedFile[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length && uploadedFiles.length + newFiles.length < maxFiles; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      const uploadedFile: UploadedFile = {
        file,
        url: '',
        type: getFileType(file),
        name: file.name,
        size: file.size,
        uploading: !error,
        error: error || undefined
      };

      newFiles.push(uploadedFile);
      if (!error) {
        validFiles.push(file);
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload valid files - use multiple upload if more than one file
    const filesToUpload = newFiles.filter(f => f.file && !f.error);
    
    if (filesToUpload.length > 1) {
      // Use multiple upload endpoint
      try {
        const uploadResults = await uploadMultipleFiles(filesToUpload.map(f => f.file!));
        
        uploadResults.forEach((result, index) => {
          const uploadedFile = filesToUpload[index];
          setUploadedFiles(prev => prev.map(f => 
            f === uploadedFile ? { 
              ...f, 
              url: result.success ? result.url : '', 
              uploading: false,
              error: result.success ? undefined : 'Upload failed'
            } : f
          ));
        });
      } catch (error) {
        // Fallback to individual uploads if multiple upload fails
        for (const uploadedFile of filesToUpload) {
          if (uploadedFile.file) {
            try {
              const url = await uploadFile(uploadedFile.file);
              setUploadedFiles(prev => prev.map(f => 
                f === uploadedFile ? { ...f, url, uploading: false } : f
              ));
            } catch (error) {
              setUploadedFiles(prev => prev.map(f => 
                f === uploadedFile ? { ...f, uploading: false, error: 'Upload failed' } : f
              ));
            }
          }
        }
      }
    } else if (filesToUpload.length === 1) {
      // Use single upload endpoint for single files
      const uploadedFile = filesToUpload[0];
      if (uploadedFile.file) {
        try {
          const url = await uploadFile(uploadedFile.file);
          setUploadedFiles(prev => prev.map(f => 
            f === uploadedFile ? { ...f, url, uploading: false } : f
          ));
        } catch (error) {
          setUploadedFiles(prev => prev.map(f => 
            f === uploadedFile ? { ...f, uploading: false, error: 'Upload failed' } : f
          ));
        }
      }
    }

    // Notify parent components
    if (onFilesChange) {
      onFilesChange(validFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (onUrlsChange) {
      onUrlsChange(newFiles.filter(f => f.url).map(f => f.url));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      console.log('Opening file dialog, multiple:', multiple, 'maxFiles:', maxFiles);
      fileInputRef.current.click();
    }
  };

  // Update parent with current URLs
  React.useEffect(() => {
    const urls = uploadedFiles.filter(f => f.url && !f.error).map(f => f.url);
    if (onUrlsChange) {
      onUrlsChange(urls);
    }
  }, [uploadedFiles, onUrlsChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      {/* Debug info */}
      <div className="text-xs text-red-500 bg-red-50 p-1 rounded">
        DEBUG: multiple={String(multiple)}, maxFiles={maxFiles}, accept={accept}
      </div>
      
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </div>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          <p className="text-xs text-gray-400">
            Max {maxFiles} files, {maxSize}MB each {multiple ? "(Hold Ctrl/Cmd to select multiple)" : "(Single file only)"}
          </p>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          console.log('File input changed:', e.target.files?.length, 'files selected');
          console.log('Multiple attribute:', multiple);
          handleFileChange(e.target.files);
        }}
        className="hidden"
        disabled={disabled}
        data-testid="file-input"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files</Label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                    {file.uploading && (
                      <p className="text-xs text-blue-500">Uploading...</p>
                    )}
                    {file.error && (
                      <p className="text-xs text-red-500">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {file.url && !file.error && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      data-testid={`view-file-${index}`}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                    data-testid={`remove-file-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}