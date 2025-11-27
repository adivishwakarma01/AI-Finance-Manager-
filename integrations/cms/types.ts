export type WixDataItem = {
  _id?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  [key: string]: any;
};

export type WixDataQueryResult<T = WixDataItem> = {
  items: T[];
  totalCount?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  cursors?: {
    next?: string;
    prev?: string;
  };
};
