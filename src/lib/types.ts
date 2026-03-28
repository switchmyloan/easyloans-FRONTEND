import type { InferType } from "yup";
import type { stage1Schema, stage2Schema } from "./schemas";

export type Stage1Data = InferType<typeof stage1Schema>;
export type Stage2Data = InferType<typeof stage2Schema>;

export type AppStage = "stage1" | "loading" | "stage2" | "success";
