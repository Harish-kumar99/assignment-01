import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}

const TeacherSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ITeacher>('Teacher', TeacherSchema);
