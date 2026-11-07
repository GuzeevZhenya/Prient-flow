import type {
  ConnectionType,
  PrinterCreateInput,
  PrinterStatus,
  PrinterTechnology,
} from "@prient-flow/shared";
import type { Tables } from "@prient-flow/database";

type PrinterRow = Tables<"printers">;

export type Printer = Omit<PrinterRow, "status" | "technology" | "connection_type"> & {
  status: PrinterStatus;
  technology: PrinterTechnology;
  connection_type: ConnectionType;
};

export interface GetPrintersArgs {
  workspaceId: string;
}

export interface CreatePrinterArgs {
  workspaceId: string;
  input: PrinterCreateInput;
}
