import exp from 'constants';
import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
    user_id: string;
    id: string;
    jobId: string;
    resumeId: string;
    score: number;
    reasoning: string;
}

const MatchSchema = new Schema<IMatch>({
    user_id: { type: String, required: true },
    id: { type: String, required: true },
    jobId: { type: String, required: true },
    resumeId: { type: String, required: true },
    score: { type: Number, required: true },
    reasoning: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IMatch>('Match', MatchSchema);