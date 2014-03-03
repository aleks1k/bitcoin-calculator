lang = 'en';
string_resx = {
	'en': {
			inputCurrency: "Currency",
			inputCurrencyRate: "Rate",
			inputDifficulty: "Difficulty",
			inputDifficultyIncrement: "Increment",
			inputElectricityPrice: "Electricity Price",
			inputEndDate: "End",
			inputHardwarePower: "Hardware Power",
			inputHashrate: "Hash Rate",
			inputPoolFee: "Pool Fee",
			inputStartDate: "Start Date",
			profit_chart_title: "Profit",
			diff_chart_title: "Difficulty",
			staticShareLink: "Share your analysis:",
			staticAllProfit: "All Profit:",
    		staticRoundTime: "Time between difficulties recalculate:",
    		tableHeaderNextDiff: "Next Difficulty Date",
            tableHeaderProfit: "Profit between difficulties recalculate",
            tableHeaderProfitSummary: "Profit Summary",
		},
	'ru': {
			inputCurrency: "Валюта",
			inputCurrencyRate: "Курс",
			inputDifficulty: "Сложность сети",
			inputDifficultyIncrement: "Изменение",
			inputElectricityPrice: "Цена за кВт*ч",
			inputEndDate: "До",
			inputHardwarePower: "Мощность майнера",
			inputHashrate: "Скорость майнера",
			inputPoolFee: "Комиссия пула",
			inputStartDate: "Время работы от",
			profit_chart_title: "Доход",
			diff_chart_title: "Сложность сети",
			staticShareLink: "Ссылка на результаты:",
			staticAllProfit: "Общая прибыль:",
    		staticRoundTime: "Время между пересчетами сложности:",
    		tableHeaderNextDiff: "Дата пересчета сложности",
            tableHeaderProfit: "Прибыль между пресчетами сложности",
            tableHeaderProfitSummary: "Общая прибыль",
		},
};

resx = function(varid){
	return string_resx[lang][varid];
};
