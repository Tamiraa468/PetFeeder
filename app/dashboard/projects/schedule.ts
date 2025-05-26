export type Schedule = {
  id: string;
  time: string;
  action: string;
  executed?: boolean;
  skipped?: boolean;
};
