import type {
  ConnectionType,
  InventoryReason,
  MaterialType,
  OrderStatus,
  PrintJobStatus,
  PrinterStatus,
  PrinterTechnology,
} from "@prient-flow/shared";

export const DEMO_WORKSHOP_NAME = "Цех «Астра»";
export const DEMO_ORDER_PREFIX = "DEMO-";

export const DEMO_WORKSHOP_SETTINGS = {
  currency: "BYN" as const,
  electricityRatePerKwh: 0.25,
  laborRatePerHour: 18,
  marginPercent: 40,
};

export interface DemoClient {
  key: string;
  name: string;
  phone: string | null;
  telegram_username: string | null;
}

export interface DemoMaterial {
  key: string;
  type: MaterialType;
  brand: string | null;
  name: string;
  color_hex: string | null;
  initial_amount: number;
  remaining_amount: number;
  cost_per_unit: number;
  low_stock_threshold: number;
}

export interface DemoPrinter {
  key: string;
  name: string;
  technology: PrinterTechnology;
  connection_type: ConnectionType;
  local_ip: string | null;
  access_code: string | null;
  power_watts: number;
  depreciation_per_hour: number;
  status: PrinterStatus;
}

export interface DemoOrderItem {
  name: string;
  quantity: number;
  technology: PrinterTechnology;
  materialKey: string;
  estimated_weight_g: number;
  estimated_time_sec: number;
  post_processing_mins: number;
}

export interface DemoJob {
  printerKey: string;
  itemIndex: number;
  status: PrintJobStatus;
  actual_weight_used_g: number;
  hoursAgoStarted: number;
  hoursAgoFinished: number | null;
  failure_reason: string | null;
}

export interface DemoOrder {
  order_number: string;
  clientKey: string;
  status: OrderStatus;
  total_price: number;
  calculated_cost: number;
  is_paid: boolean;
  daysAgo: number;
  items: DemoOrderItem[];
  job: DemoJob | null;
}

export interface DemoInventoryLog {
  materialKey: string;
  delta_amount: number;
  reason: InventoryReason;
  orderNumber: string | null;
}

export const DEMO_CLIENTS: DemoClient[] = [
  {
    key: "anna",
    name: "Анна Ковалёва",
    phone: "+375 29 111-22-33",
    telegram_username: "@anna_minis",
  },
  {
    key: "pixel",
    name: "ООО «Пиксель»",
    phone: "+375 17 200-10-10",
    telegram_username: "@pixel_studio",
  },
  {
    key: "maxim",
    name: "Максим Орлов",
    phone: "+375 33 555-01-02",
    telegram_username: "@max_proto",
  },
  {
    key: "sever",
    name: "Студия «Север»",
    phone: "+375 29 700-88-11",
    telegram_username: "@sever_arch",
  },
  {
    key: "irina",
    name: "Ирина Белая",
    phone: "+375 44 321-00-15",
    telegram_username: null,
  },
  {
    key: "dmitry",
    name: "Дмитрий Чайка",
    phone: "+375 25 909-44-21",
    telegram_username: "@dronecraft",
  },
];

export const DEMO_MATERIALS: DemoMaterial[] = [
  {
    key: "pla_black",
    type: "filament",
    brand: "Bambu",
    name: "PLA Basic чёрный",
    color_hex: "#1A1A1A",
    initial_amount: 1000,
    remaining_amount: 780,
    cost_per_unit: 0.045,
    low_stock_threshold: 200,
  },
  {
    key: "petg_white",
    type: "filament",
    brand: "eSUN",
    name: "PETG белый",
    color_hex: "#F4F4F5",
    initial_amount: 1000,
    remaining_amount: 140,
    cost_per_unit: 0.05,
    low_stock_threshold: 250,
  },
  {
    key: "tpu",
    type: "filament",
    brand: "Recreus",
    name: "TPU Filaflex",
    color_hex: "#E11D48",
    initial_amount: 500,
    remaining_amount: 410,
    cost_per_unit: 0.08,
    low_stock_threshold: 80,
  },
  {
    key: "resin_grey",
    type: "resin",
    brand: "Anycubic",
    name: "Standard Grey",
    color_hex: "#6B7280",
    initial_amount: 1000,
    remaining_amount: 160,
    cost_per_unit: 0.12,
    low_stock_threshold: 250,
  },
  {
    key: "resin_abs",
    type: "resin",
    brand: "Elegoo",
    name: "ABS-like бежевый",
    color_hex: "#D6D3D1",
    initial_amount: 1000,
    remaining_amount: 820,
    cost_per_unit: 0.14,
    low_stock_threshold: 200,
  },
  {
    key: "paint_red",
    type: "paint",
    brand: "Vallejo",
    name: "Model Color красный",
    color_hex: "#B91C1C",
    initial_amount: 200,
    remaining_amount: 38,
    cost_per_unit: 0.35,
    low_stock_threshold: 50,
  },
  {
    key: "primer",
    type: "primer",
    brand: "Mr.Hobby",
    name: "Surfacer 1000",
    color_hex: "#9CA3AF",
    initial_amount: 400,
    remaining_amount: 310,
    cost_per_unit: 0.18,
    low_stock_threshold: 80,
  },
  {
    key: "ipa",
    type: "consumable",
    brand: "Solins",
    name: "Изопропиловый спирт",
    color_hex: null,
    initial_amount: 5000,
    remaining_amount: 1200,
    cost_per_unit: 0.012,
    low_stock_threshold: 500,
  },
  {
    key: "glue",
    type: "consumable",
    brand: "Magigoo",
    name: "Клей для стола",
    color_hex: null,
    initial_amount: 3,
    remaining_amount: 1,
    cost_per_unit: 12,
    low_stock_threshold: 2,
  },
];

export const DEMO_PRINTERS: DemoPrinter[] = [
  {
    key: "x1c",
    name: "Bambu Lab X1 Carbon",
    technology: "FDM",
    connection_type: "bambu_mqtt",
    local_ip: "192.168.1.40",
    access_code: "demo-x1c",
    power_watts: 350,
    depreciation_per_hour: 1.5,
    status: "printing",
  },
  {
    key: "p1s",
    name: "Bambu Lab P1S",
    technology: "FDM",
    connection_type: "bambu_mqtt",
    local_ip: "192.168.1.42",
    access_code: "demo-p1s",
    power_watts: 320,
    depreciation_per_hour: 1.1,
    status: "paused",
  },
  {
    key: "voron",
    name: "Voron 2.4",
    technology: "FDM",
    connection_type: "moonraker",
    local_ip: "192.168.1.41",
    access_code: null,
    power_watts: 400,
    depreciation_per_hour: 0.8,
    status: "idle",
  },
  {
    key: "photon",
    name: "Anycubic Photon Mono X",
    technology: "SLA",
    connection_type: "manual",
    local_ip: null,
    access_code: null,
    power_watts: 120,
    depreciation_per_hour: 0.6,
    status: "printing",
  },
  {
    key: "k1",
    name: "Creality K1",
    technology: "FDM",
    connection_type: "octoprint",
    local_ip: "192.168.1.55",
    access_code: null,
    power_watts: 350,
    depreciation_per_hour: 0.4,
    status: "offline",
  },
  {
    key: "a1",
    name: "Bambu Lab A1 mini",
    technology: "FDM",
    connection_type: "bambu_mqtt",
    local_ip: "192.168.1.43",
    access_code: "demo-a1",
    power_watts: 150,
    depreciation_per_hour: 0.5,
    status: "error",
  },
];

export const DEMO_ORDERS: DemoOrder[] = [
  {
    order_number: "DEMO-2411-01",
    clientKey: "irina",
    status: "draft",
    total_price: 85,
    calculated_cost: 54,
    is_paid: false,
    daysAgo: 0,
    items: [
      {
        name: "Топпер на торт «И&М»",
        quantity: 2,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 28,
        estimated_time_sec: 5400,
        post_processing_mins: 20,
      },
    ],
    job: null,
  },
  {
    order_number: "DEMO-2411-02",
    clientKey: "maxim",
    status: "quoted",
    total_price: 140,
    calculated_cost: 96,
    is_paid: false,
    daysAgo: 1,
    items: [
      {
        name: "Корпус датчика IoT",
        quantity: 1,
        technology: "FDM",
        materialKey: "petg_white",
        estimated_weight_g: 62,
        estimated_time_sec: 14400,
        post_processing_mins: 25,
      },
    ],
    job: null,
  },
  {
    order_number: "DEMO-2411-03",
    clientKey: "pixel",
    status: "approved",
    total_price: 360,
    calculated_cost: 220,
    is_paid: false,
    daysAgo: 2,
    items: [
      {
        name: "Брелок с логотипом",
        quantity: 24,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 8,
        estimated_time_sec: 1200,
        post_processing_mins: 5,
      },
    ],
    job: null,
  },
  {
    order_number: "DEMO-2411-04",
    clientKey: "anna",
    status: "printing",
    total_price: 190,
    calculated_cost: 118,
    is_paid: false,
    daysAgo: 1,
    items: [
      {
        name: "Отряд космодесанта, 32 мм",
        quantity: 5,
        technology: "SLA",
        materialKey: "resin_grey",
        estimated_weight_g: 18,
        estimated_time_sec: 21600,
        post_processing_mins: 40,
      },
    ],
    job: {
      printerKey: "photon",
      itemIndex: 0,
      status: "printing",
      actual_weight_used_g: 12,
      hoursAgoStarted: 4,
      hoursAgoFinished: null,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-05",
    clientKey: "sever",
    status: "post_processing",
    total_price: 520,
    calculated_cost: 340,
    is_paid: false,
    daysAgo: 4,
    items: [
      {
        name: "Макет квартала 1:500",
        quantity: 1,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 420,
        estimated_time_sec: 86400,
        post_processing_mins: 90,
      },
    ],
    job: {
      printerKey: "voron",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 438,
      hoursAgoStarted: 80,
      hoursAgoFinished: 12,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-06",
    clientKey: "anna",
    status: "painting",
    total_price: 210,
    calculated_cost: 128,
    is_paid: false,
    daysAgo: 5,
    items: [
      {
        name: "Дракон 32 мм под покраску",
        quantity: 1,
        technology: "SLA",
        materialKey: "resin_abs",
        estimated_weight_g: 22,
        estimated_time_sec: 18000,
        post_processing_mins: 120,
      },
    ],
    job: {
      printerKey: "photon",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 24,
      hoursAgoStarted: 96,
      hoursAgoFinished: 48,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-07",
    clientKey: "dmitry",
    status: "ready",
    total_price: 95,
    calculated_cost: 61,
    is_paid: false,
    daysAgo: 3,
    items: [
      {
        name: "Крепление FPV-камеры",
        quantity: 2,
        technology: "FDM",
        materialKey: "petg_white",
        estimated_weight_g: 16,
        estimated_time_sec: 7200,
        post_processing_mins: 15,
      },
    ],
    job: {
      printerKey: "p1s",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 17,
      hoursAgoStarted: 50,
      hoursAgoFinished: 30,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-08",
    clientKey: "pixel",
    status: "completed",
    total_price: 780,
    calculated_cost: 480,
    is_paid: true,
    daysAgo: 12,
    items: [
      {
        name: "Кубок «Пиксель 2026»",
        quantity: 3,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 180,
        estimated_time_sec: 28800,
        post_processing_mins: 45,
      },
    ],
    job: {
      printerKey: "x1c",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 186,
      hoursAgoStarted: 260,
      hoursAgoFinished: 220,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-09",
    clientKey: "maxim",
    status: "cancelled",
    total_price: 0,
    calculated_cost: 38,
    is_paid: false,
    daysAgo: 8,
    items: [
      {
        name: "Прототип корпуса v1 (брак)",
        quantity: 1,
        technology: "FDM",
        materialKey: "tpu",
        estimated_weight_g: 40,
        estimated_time_sec: 10800,
        post_processing_mins: 0,
      },
    ],
    job: {
      printerKey: "k1",
      itemIndex: 0,
      status: "failed",
      actual_weight_used_g: 19,
      hoursAgoStarted: 190,
      hoursAgoFinished: 186,
      failure_reason: "Отлип от стола на 40%",
    },
  },
  {
    order_number: "DEMO-2411-10",
    clientKey: "pixel",
    status: "printing",
    total_price: 240,
    calculated_cost: 148,
    is_paid: true,
    daysAgo: 0,
    items: [
      {
        name: "Табличка на стол, 12 шт",
        quantity: 12,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 14,
        estimated_time_sec: 2400,
        post_processing_mins: 8,
      },
    ],
    job: {
      printerKey: "x1c",
      itemIndex: 0,
      status: "printing",
      actual_weight_used_g: 48,
      hoursAgoStarted: 3,
      hoursAgoFinished: null,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-11",
    clientKey: "sever",
    status: "quoted",
    total_price: 310,
    calculated_cost: 198,
    is_paid: false,
    daysAgo: 2,
    items: [
      {
        name: "Фасад здания, SLA",
        quantity: 1,
        technology: "SLA",
        materialKey: "resin_grey",
        estimated_weight_g: 95,
        estimated_time_sec: 43200,
        post_processing_mins: 60,
      },
    ],
    job: null,
  },
  {
    order_number: "DEMO-2411-12",
    clientKey: "irina",
    status: "completed",
    total_price: 450,
    calculated_cost: 280,
    is_paid: true,
    daysAgo: 18,
    items: [
      {
        name: "Фигурки молодожёнов",
        quantity: 1,
        technology: "SLA",
        materialKey: "resin_abs",
        estimated_weight_g: 36,
        estimated_time_sec: 25200,
        post_processing_mins: 180,
      },
    ],
    job: {
      printerKey: "photon",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 38,
      hoursAgoStarted: 400,
      hoursAgoFinished: 360,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-13",
    clientKey: "anna",
    status: "ready",
    total_price: 70,
    calculated_cost: 41,
    is_paid: true,
    daysAgo: 6,
    items: [
      {
        name: "Подставки под миниатюры",
        quantity: 10,
        technology: "FDM",
        materialKey: "pla_black",
        estimated_weight_g: 6,
        estimated_time_sec: 900,
        post_processing_mins: 10,
      },
    ],
    job: {
      printerKey: "a1",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 62,
      hoursAgoStarted: 140,
      hoursAgoFinished: 120,
      failure_reason: null,
    },
  },
  {
    order_number: "DEMO-2411-14",
    clientKey: "dmitry",
    status: "post_processing",
    total_price: 110,
    calculated_cost: 72,
    is_paid: false,
    daysAgo: 2,
    items: [
      {
        name: "Пропеллеры TPU, 5″",
        quantity: 8,
        technology: "FDM",
        materialKey: "tpu",
        estimated_weight_g: 9,
        estimated_time_sec: 3600,
        post_processing_mins: 20,
      },
    ],
    job: {
      printerKey: "voron",
      itemIndex: 0,
      status: "success",
      actual_weight_used_g: 74,
      hoursAgoStarted: 40,
      hoursAgoFinished: 16,
      failure_reason: null,
    },
  },
];

export const DEMO_INVENTORY_LOGS: DemoInventoryLog[] = [
  { materialKey: "pla_black", delta_amount: 1000, reason: "restock", orderNumber: null },
  {
    materialKey: "pla_black",
    delta_amount: -186,
    reason: "print_success",
    orderNumber: "DEMO-2411-08",
  },
  {
    materialKey: "resin_grey",
    delta_amount: -12,
    reason: "print_success",
    orderNumber: "DEMO-2411-04",
  },
  { materialKey: "tpu", delta_amount: -19, reason: "print_fail", orderNumber: "DEMO-2411-09" },
  {
    materialKey: "petg_white",
    delta_amount: -17,
    reason: "print_success",
    orderNumber: "DEMO-2411-07",
  },
  { materialKey: "paint_red", delta_amount: -12, reason: "manual_adjustment", orderNumber: null },
];
