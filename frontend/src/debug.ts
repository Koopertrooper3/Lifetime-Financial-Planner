export const isDebug = false
export type User = {
    _id: string;
    name: string;
    email: string;
    ownedScenarios: string[];
    [key: string]: any; //for flexibility
  };