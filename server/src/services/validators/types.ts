import type { FormData, Associe } from "../../types/generator";
import ohadaRules from "../../../data/ohada-rules.json";

export interface ValidationError {
  field: string;
  message: string;
}

export { ohadaRules };
