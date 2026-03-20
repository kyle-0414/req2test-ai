import { SourceDocument } from '../features/documents/model';
import { DocumentType, SourceFileType } from '../types/enums';

export function mapDocTypeLabelToEnum(label: string): DocumentType {
  const map: Record<string, DocumentType> = {
    'Requirements Document': 'requirements_doc',
    'Screen Spec': 'screen_spec',
    'Change Request': 'change_request',
    'Capture': 'capture',
    'Other': 'other'
  };
  return map[label] || 'other';
}

export function getFileTypeFromMime(mime: string): SourceFileType {
  if (mime.includes('png')) return 'png';
  if (mime.includes('svg')) return 'png'; // treat svg as image/png for now if needed, though they asked for png/jpg
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'png'; // fallback to png or maybe webp isn't in enum, enum has 'png' | 'jpg' | 'pdf' | 'docx' | 'txt' | 'unknown'
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('document')) return 'docx';
  if (mime.includes('text')) return 'txt';
  return 'unknown';
}

export function createImageSourceDocument(
  file: File,
  docTypeLabel: string,
  projectId: string = 'proj-default'
): SourceDocument {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
  
  // Create object URL for preview
  let previewUrl: string | undefined = undefined;
  if (file.type.startsWith('image/')) {
    previewUrl = URL.createObjectURL(file);
  }

  // Create document
  const doc: SourceDocument = {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    projectId,
    fileName: file.name,
    fileType: getFileTypeFromMime(file.type),
    documentType: mapDocTypeLabelToEnum(docTypeLabel),
    uploadedAt: new Date().toISOString(),
    size: file.size,
    parseStatus: 'idle',
    previewUrl,
    ocrText: '',
    extractedText: ''
  };

  return doc;
}
