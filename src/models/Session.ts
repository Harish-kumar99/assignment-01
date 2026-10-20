import mongoose, { Schema, Document } from 'mongoose';

export enum SessionStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED'
}

export interface ISession extends Document {
  teacherId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | null;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  completedAt?: Date;
}

const SessionSchema: Schema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.AVAILABLE
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model<ISession>('Session', SessionSchema);
