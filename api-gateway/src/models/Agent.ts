import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  user_id: string;
  resume_id: string;
  portal: string;
  status: string;
}

const AgentSchema = new Schema<IAgent>({
  user_id: { type: String, required: true },
  resume_id: { type: String, required: true },
  portal: { type: String, required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.model<IAgent>('Agent', AgentSchema);
