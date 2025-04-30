export const isDebug = true;

export type User = {
  _id: string;
  name: string;
  email: string;
  ownedScenarios: string[];
  [key: string]: any; //for flexibility
};
  
