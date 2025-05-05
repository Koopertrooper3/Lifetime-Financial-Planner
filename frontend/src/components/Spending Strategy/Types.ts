export type Status = "Expenses"

export type Item = {
  id: string,
  rank: number,
  status: Status;
  name: string;
};

export type Column = {
  id: Status;
  name: string;
};