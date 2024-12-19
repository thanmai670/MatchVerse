import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
    user_id: string;
    id: string;
    personal_information: {
        name: string;
        email: string;
        phone: string;
        github: string;
        linkedin: string;
    }
    skills: string[];
    education: string[];
    work_experience: string[];
    projects: string[];
    certifications: string[];
    unstructured_text_blocks: string[];
}
const ResumeSchema = new Schema<IResume>({
    user_id: { type: String, required: true },
    id: { type: String, required: true },
    personal_information: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: false },
        github: { type: String, required: false },
        linkedin: { type: String, required: false }
    },
    skills: { type: [String], required: true },
    education: { type: [String], required: true },
    work_experience: { type: [String], required: true },
    projects: { type: [String], required: true },
    certifications: { type: [String], required: false },
    unstructured_text_blocks: { type: [String], required: false },
}, { timestamps: true });

export default mongoose.model<IResume>('Resume', ResumeSchema);