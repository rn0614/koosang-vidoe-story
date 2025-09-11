import { DocumentMetadata } from './document-metadata';

type TagWithCount = {
  tag: string;
  count: number;
};

type Document = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata: DocumentMetadata;
};

export type { TagWithCount, Document };
