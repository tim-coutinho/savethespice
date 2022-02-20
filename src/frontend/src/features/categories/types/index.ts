export interface Category {
  userId: string;
  categoryId: number;
  updateTime: string;
  createTime: string;
  name: string;
}

export type CategoryMap = Map<number, Category>;
