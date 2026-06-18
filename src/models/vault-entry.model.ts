import mongoose, { type Document, type Model, Schema } from "mongoose";
import { VAULT_ENTRY_TYPES } from "@/lib/constants";

export interface IVaultEntry extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content?: string;
  type: (typeof VAULT_ENTRY_TYPES)[number];
  tags: string[];
  linkedVision?: mongoose.Types.ObjectId;
  linkedGoal?: mongoose.Types.ObjectId;
  linkedAction?: mongoose.Types.ObjectId;
  linkedFocusSession?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vaultEntrySchema = new Schema<IVaultEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    type: {
      type: String,
      enum: VAULT_ENTRY_TYPES,
      default: "NOTE",
    },
    tags: { type: [String], default: [] },
    linkedVision: { type: Schema.Types.ObjectId, ref: "Vision" },
    linkedGoal: { type: Schema.Types.ObjectId, ref: "Goal" },
    linkedAction: { type: Schema.Types.ObjectId, ref: "Action" },
    linkedFocusSession: { type: Schema.Types.ObjectId, ref: "FocusSession" },
  },
  { timestamps: true }
);

vaultEntrySchema.index({ userId: 1, type: 1 });
vaultEntrySchema.index({ userId: 1, updatedAt: -1 });
vaultEntrySchema.index({ userId: 1, tags: 1 });
vaultEntrySchema.index({ linkedVision: 1 });
vaultEntrySchema.index({ linkedGoal: 1 });
vaultEntrySchema.index({ linkedAction: 1 });
vaultEntrySchema.index({ linkedFocusSession: 1 });

const VaultEntry: Model<IVaultEntry> =
  mongoose.models.VaultEntry ??
  mongoose.model<IVaultEntry>("VaultEntry", vaultEntrySchema);

export default VaultEntry;
