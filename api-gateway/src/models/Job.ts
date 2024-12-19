import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
}

const JobSchema = new Schema<IJob>({
  id: { type: String, required: true },
  jobId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: false },
  location: { type: String, required: false },
  description: { type: String, required: false },
  datePosted: { type: String, required: false },
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);