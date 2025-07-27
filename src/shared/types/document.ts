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
  metadata: {
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    excerpt: string;
    thumbnail: string;
  };
};

export type { TagWithCount, Document };
