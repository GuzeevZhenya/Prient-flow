import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { calculateCost, calculatePrice, DEFECT_RISK, type PricingInput } from "@prient-flow/shared";
import { selectSessionStatus } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { formatMoney } from "@/shared/lib";

interface SampleJob {
  title: string;
  story: string;
  input: PricingInput;
}

const SAMPLES: SampleJob[] = [
  {
    title: "Миниатюра, SLA",
    story: "32 мм, смола, промывка и грунт. Типичный заказ студии покраса.",
    input: {
      weightGrams: 22,
      costPerGram: 0.14,
      printTimeSec: 18_000,
      powerWatts: 120,
      electricityRatePerKwh: 0.25,
      depreciationPerHour: 0.6,
      postProcessingMins: 40,
      laborRatePerHour: 18,
      defectRiskFactor: DEFECT_RISK.SLA_COMPLEX,
      marginPercent: 40,
    },
  },
  {
    title: "Корпус датчика, FDM",
    story: "PETG, 4 часа печати, лёгкая постобработка. Прототип для инженера.",
    input: {
      weightGrams: 62,
      costPerGram: 0.05,
      printTimeSec: 14_400,
      powerWatts: 350,
      electricityRatePerKwh: 0.25,
      depreciationPerHour: 1.5,
      postProcessingMins: 25,
      laborRatePerHour: 18,
      defectRiskFactor: DEFECT_RISK.FDM_SIMPLE,
      marginPercent: 40,
    },
  },
  {
    title: "Тираж брелоков",
    story: "24 штуки PLA. Себестоимость тиража, не «ну рублей 15 за штуку».",
    input: {
      weightGrams: 192,
      costPerGram: 0.045,
      printTimeSec: 28_800,
      powerWatts: 350,
      electricityRatePerKwh: 0.25,
      depreciationPerHour: 1.5,
      postProcessingMins: 120,
      laborRatePerHour: 18,
      defectRiskFactor: DEFECT_RISK.FDM_SIMPLE,
      marginPercent: 40,
    },
  },
];

export function CalculatorPage() {
  const sessionStatus = useSelector(selectSessionStatus);
  const homeTo = sessionStatus === "authenticated" ? ROUTES.dashboard : ROUTES.login;
  const homeLabel = sessionStatus === "authenticated" ? "На главную" : "Вход в цех";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3 sm:px-10">
          <Link to={homeTo} className="text-sm font-semibold text-slate-900">
            Prient-flow
          </Link>
          <Link
            to={homeTo}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            {homeLabel}
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl p-6 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">Калькулятор</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Стоимость печати</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Публичная витрина для клиента появится вместе с 3D-вьювером: бросил STL — увидел модель и
          цену. Пока здесь живые цифры ядра: материал + электричество + амортизация + труд × риск
          брака, затем маржа мастерской.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SAMPLES.map((sample) => {
            const cost = calculateCost(sample.input);
            const price = calculatePrice(sample.input);
            return (
              <article
                key={sample.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-slate-900">{sample.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{sample.story}</p>
                <dl className="mt-4 space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <dt>Вес</dt>
                    <dd>{sample.input.weightGrams} г</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Печать</dt>
                    <dd>{Math.round(sample.input.printTimeSec / 3600)} ч</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Себестоимость</dt>
                    <dd>{formatMoney(cost)} BYN</dd>
                  </div>
                </dl>
                <p className="mt-4 text-2xl font-semibold text-slate-900">
                  {formatMoney(price)} BYN
                </p>
                <p className="mt-1 text-xs text-slate-500">цена клиенту при марже 40%</p>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Канбан, склад и парк принтеров —{" "}
          <Link to={homeTo} className="font-medium text-slate-800 underline">
            {homeLabel.toLowerCase()}
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
