import { ObjectId } from "mongodb";

export type DBTournament = {
  _id: ObjectId;
  name: string;
  info: string;
  finished?: boolean;
};

export type SerializedTournament = Omit<DBTournament, "_id"> & {
  _id: string;
};
