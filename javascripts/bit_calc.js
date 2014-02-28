		google.load("visualization", "1", {packages:["corechart"]});

    	// https://blockchain.info/ru/stats?format=json
    	var btc_stats = {"trade_volume_btc":20558.38042413,"electricity_consumption":4.247113588840637E8,"miners_revenue_usd":2449088.42178,"n_btc_mined":437500000000,"trade_volume_usd":1.1471700038114693E7,"difficulty":3.1295731745222874E9,"minutes_between_blocks":8.228571428571428,"days_destroyed":0.0,"n_tx":70705,"hash_rate":2.7225087107952803E7,"timestamp":1392914289855,"n_blocks_mined":175,"blocks_size":40505389,"total_fees_btc":1457429764,"miners_operating_margin":-2501.0,"total_btc_sent":48200321939415,"estimated_btc_sent":9418058124214,"totalbc":1237927500000000,"electricity_cost_usd":6.370670383260956E7,"n_blocks_total":286903,"nextretarget":288287,"estimated_transaction_volume_usd":5.25533313002132E7,"miners_revenue_btc":4389,"market_price_usd":558.00602};

    	// http://www.coinchoose.com/api.php?base=BTC
    	var coins_stats = [{"0":"LTC","symbol":"LTC","1":"Litecoin","name":"Litecoin","2":"scrypt","algo":"scrypt","3":"517821","currentBlocks":"517821","4":"3206.90479195","difficulty":"3206.90479195","5":"50","reward":"50","6":"2.5","minBlockTime":"2.5","7":"101606082519","networkhashrate":"101606082519","price":"0.02532","exchange":"BTC-e","exchange_url":"https:\/\/btc-e.com","ratio":4941.8862061521,"adjustedratio":4817.3008396105,"avgProfit":"5034.156551355906","avgHash":"85536263767.5526"}];

		var getDiffIncrice = function(diff_history)
		{
	    	var diffInc_history	= [];
	    	for (var i=1;i<diff_history.length;i++)
			{
				var diffInc = (diff_history[i] - diff_history[i-1]) / diff_history[i-1];
				diffInc_history.push(diffInc);
			}
			return diffInc_history
		};

		var getDiffIncriceAver = function(diffInc_history, use_last_n)
		{
			if (diffInc_history.length < use_last_n)
			{
				console.log('warning, diffInc_history not enough');
				use_last_n = diffInc_history.length;
			}
	    	var diffInc_aver = 0;
	    	var use_last_n = 3;
	    	for (var i=diffInc_history.length-1;i>diffInc_history.length-1-use_last_n;i--)
			{
				diffInc_aver += diffInc_history[i];
			}
			diffInc_aver /= use_last_n;

			diffInc_aver = diffInc_aver.toFixed(3);

			return diffInc_aver
		}

		var getNextDiff = function(difficulty, n_blocks_total, minutes_between_blocks, blocks_between_recalc, minutes_between_blocks_normal)
		{
		    var allNetworkHashrate = difficulty * Math.pow(2, 32) / ( minutes_between_blocks * 60 ) / 1e12;
		    var currentNetworkDifficulty = allNetworkHashrate / (Math.pow(2, 32) / ( minutes_between_blocks_normal * 60 ) / 1e12);

		    var difficultyIncrisePerBlock = (currentNetworkDifficulty - difficulty) / (n_blocks_total % blocks_between_recalc);

		    var blocks_left = blocks_between_recalc - ( n_blocks_total % blocks_between_recalc );

		    var nextDifficulty = currentNetworkDifficulty + blocks_left * difficultyIncrisePerBlock;

		    var diffInc = (nextDifficulty - difficulty) / difficulty;

			var nextDifficultyTimeLeft = 0.5 * blocks_left * (minutes_between_blocks * 60 + (minutes_between_blocks_normal * 60 / (1 + diffInc)));

			res = {
				nextDifficulty: nextDifficulty,
				nextDifficultyTimeLeft: nextDifficultyTimeLeft,
				blocks_left: blocks_left,
				diffInc: diffInc
			};
			console.log(res, nextDifficultyTimeLeft/60/60/24);
			return res;
		}

    	var base_crypto = "BTC";

    	var stats = {};
    	var btc_market_price_usd = btc_stats.market_price_usd;
    	var timestamp = (new Date().getTime());

    	var get_crypto_stats = function(crypto){
    		var st_res = {};
    		$.each(coins_stats, function(index, entry) {
    			// console.log(entry.symbol);
    			if (entry.symbol == crypto)
    			{
    				st_res = {
						"difficulty": Number(entry.difficulty),
						"timestamp": timestamp,
						//"n_blocks_mined":175,
						"n_blocks_total": Number(entry.currentBlocks),
						"btc_price": entry.price,
						"market_price_usd": entry.price * btc_market_price_usd,
						"minutes_between_blocks_normal": Number(entry.minBlockTime),
						"block_reward": entry.reward,
						"diff_history": [1, 1, 1, 1],
						"blocks_between_recalc": 2016,
					};
					if (entry.networkhashrate > 0)
		    		{
    					st_res.minutes_between_blocks = entry.difficulty * Math.pow(2, 32) / ( entry.networkhashrate * 60 ) / 1e12;
		    		}
		    		else
		    		{
		    			st_res.minutes_between_blocks = st_res.minutes_between_blocks_normal;
		    		}
		    		if (entry.symbol == 'LTC')
		    		{
		    			st_res.reward_halved_blocks = 840000;
						st_res.diff_history = [3300, 2820, 3508, 2674, 2690, 3207, 2871, 3322];
		    		}
		    		else if (entry.symbol == 'DOGE')
		    		{
		    			st_res.blocks_between_recalc = 4 * 60;
		    			st_res.reward_func = function(val)
		    			{
		    				var block_n = val.stats.n_blocks_total;
		    				if (block_n > 600000)
		    					this.block_reward = 10000;
		    				else{
		    					var max_reward = 1000000 * Math.pow(0.5, Math.floor(block_n / 100000));
	    						this.block_reward = 0.5 * max_reward;
		    				}
		    				return this.block_reward;
		    			};
		    		}
					// break;
    			}
			});
			console.log(st_res);
			return st_res;
    	};
    	var calc = function()
    	{
    		var inputs = $('#calculator-form form :input');
    		var params = {};
			inputs.each(function() {
				var id = $(this).attr('id');
				var val = $(this).val();
				if (id == 'inputDifficultyIncrement' || id == 'inputPoolFee')
				{
					val /= 100;
				}
				else if (id == 'inputStartDate' || id == 'inputEndDate')
				{
					val = Date.parse(val);
				    if (!isNaN(val)) {
			    		val /= 1000;
			    	}
				}
				else if (id == 'inputDifficulty')
				{
					val = Number(val);
				}
				else if (id == 'inputCurrency')
				{
					params.currency = val;
					if (val == "BASE_CURR"){
						params.currency = base_crypto;
					}
				}
        		params[id] = val;
    		});

    		params.stats = stats;

    		params.hashrate = function() {
    			return this.inputHashrate * this.inputHashrateLevel;
    		};

		    params.elBtcCostPerSecond = function(){
			    var usd_rate = this.stats.market_price_usd;
		    	return this.inputHardwarePower / 1000 * this.inputElectricityPrice / usd_rate / 60 / 60;
		    };

		    params.calc_coins_constants = function(){
		    	if (this.stats.reward_halved_blocks != undefined) {
		    		this.stats.block_reward = 50 * Math.pow(0.5, Math.floor(this.stats.n_blocks_total / this.stats.reward_halved_blocks));
		    		console.log(this.stats.block_reward);
		    	}
		    	else if (this.stats.reward_func != undefined)
		    	{
		    		this.stats.block_reward = this.stats.reward_func(this);
		    		console.log(this.stats.block_reward);
		    	}
		    	this.stats.all_hashrate = this.inputDifficulty * Math.pow(2, 32) / ( this.stats.minutes_between_blocks * 60 ) / 1e12;
		    	this.stats.blocks_left = this.stats.blocks_between_recalc - this.stats.n_blocks_total % this.stats.blocks_between_recalc;

			    //this.n_blocks = Math.ceil(n_blocks_total / blocks_between_recalc);

		    	this.stats.next_diff_time_left = 0.5 * this.stats.blocks_left * (this.stats.minutes_between_blocks * 60 + (this.stats.minutes_between_blocks_normal * 60 / (1 + this.inputDifficultyIncrement)));
		    };

		    params.getProfit = function(diff, time)
			{
				return ( this.stats.block_reward * time / diff * this.hashrate() / Math.pow(2, 32) ) * (1 - this.inputPoolFee) - this.elBtcCostPerSecond() * time;
			};
		    calulatorParams = params;

		    params.init = function() {
			    this.calc_coins_constants();

			    this.result = {profitList: [], btcSum: 0, diffList: [['Date', 'Difficulty'], [new Date(this.stats.timestamp), this.inputDifficulty]], startTime: this.stats.timestamp / 1000 };
			    this.current = {};
				this.current.step = 0;
				this.current.stop = false;
		    	this.current.diff = this.inputDifficulty;
		    	this.current.n_blocks = this.stats.n_blocks_total;
		    	this.current.startTimePeriod = this.stats.timestamp / 1000;
		    	this.current.endTimePeriod = this.current.startTimePeriod + this.stats.next_diff_time_left;

		    	this.result.timeDiff = 0.5 * this.stats.blocks_between_recalc * (this.stats.minutes_between_blocks_normal * 60 * (1 + 1/(1 + this.inputDifficultyIncrement))) /60/60/24;
		    	this.result.timeDiff = this.result.timeDiff.toFixed(2);
			};
		    params.calc_profit_step = function(){
			    var time_interval = this.current.endTimePeriod - this.current.startTimePeriod;
			    var pass_iteration = false;

			    if (isNaN(this.inputStartDate) || this.current.startTimePeriod >= this.inputStartDate)
			    {
			    	// this.inputStartDate = NaN;
			    }
			    else if (this.current.endTimePeriod < this.inputStartDate)
			    {
			    	time_interval = 0;
			    	pass_iteration = true;
			    }
			    else
			    {
			    	this.result.startTime = this.inputStartDate;
			    	time_interval = this.current.endTimePeriod - this.inputStartDate;
			    }

			    if (!isNaN(this.inputEndDate) && this.current.endTimePeriod > this.inputEndDate)
			    {
			    	time_interval -= this.current.endTimePeriod - this.inputEndDate;
			    	this.current.endTimePeriod = this.inputEndDate;
			    	this.current.stop = true;
				}
				var profit = this.getProfit(this.current.diff, time_interval);

				if (!pass_iteration)
				{
			    	if (isNaN(this.inputEndDate) && params.current.step >= 3 && profit <= 1e-6)
			    		this.current.stop = true;
			    	else {
				    	this.result.btcSum += profit;
					    this.result.profitList.push({
					    	date: new Date(this.current.endTimePeriod * 1000), 
					    	diff: this.current.diff, 
					    	profit: profit * this.inputCurrencyRate, 
					    	result: this.result.btcSum * this.inputCurrencyRate});
					}
				}

				if (!this.current.stop)
				{
				    this.result.diffList.push([new Date(this.current.endTimePeriod * 1000), this.current.diff]);
				    this.current.step += 1;
			    	this.current.diff *= 1 + this.inputDifficultyIncrement;
			    	this.current.n_blocks += this.stats.blocks_between_recalc;
				    this.current.startTimePeriod = this.current.endTimePeriod;
				    time_interval = 0.5 * this.stats.blocks_between_recalc * (this.stats.minutes_between_blocks_normal * 60 * (1 + 1/(1 + this.inputDifficultyIncrement)));
				    this.current.endTimePeriod = this.current.startTimePeriod + time_interval;
				    this.result.diffList.push([new Date((this.current.startTimePeriod + 1) * 1000), this.current.diff]);
				}
		    };
		    	params.init();
			    do
			    {
			    	params.calc_profit_step();
			    } while(params.current.step < 100 && !params.current.stop);
			    
			    var profit_list = params.result.profitList;

			    var resultTable = $("#resultTable");
				resultTable.empty();

			    var chartArray = [['Date', 'Profit'], [new Date(params.result.startTime*1000), 0]];
			    var chartDiffArray = [['Date', 'Difficulty']];
			    var prevDate = new Date(stats['timestamp']);
			    // var prevDiff = stats['difficulty'];
			    // chartDiffArray.push([, prevDiff]);
			    //chartArray.push([prevDate, 0, 0]);
				function padStr(i) {
				    return (i < 10) ? "0" + i : "" + i;
				}

				$.each(profit_list, function(i)
				{
				    var datetime = profit_list[i]['date'];
				    var dateStr = padStr(datetime.getDate()) + '-' + padStr(datetime.getMonth() + 1) + '-' + datetime.getFullYear();
			    	
			    	resultTable.append('<tr><td>'+ 
			    		dateStr +'</td><td>'+ 
			    		profit_list[i]['profit'].toFixed(6) +'</td><td>'+ 
			    		profit_list[i]['result'].toFixed(6) +'</td></tr>');


			    	chartArray.push([profit_list[i]['date'], profit_list[i]['result']]); //profit_list[i]['profit'], 
				    //var d = profit_list[i]['date'];
				    //if (prevDiff != 0)
				    //{
					    chartDiffArray.push([prevDate, profit_list[i]['diff']]);
				    //}
				    prevDate = new Date(profit_list[i]['date'] - 1000);
				    chartDiffArray.push([profit_list[i]['date'], profit_list[i]['diff']]);
//				    prevDiff = profit_list[i]['diff'];
				});


				var data = google.visualization.arrayToDataTable(chartArray);

				var options = {
				  title: 'Profit',
				  legend: {position: 'none'},
				  height: 400,
				  vAxis: {title: params.currency,  titleTextStyle: {color: '#333'}, minValue: 0}
				};
				// if (!isNaN(start_date))
				// {
				// 	options['hAxis'] = {minValue: new Date(start_date*1000)};
				// }

				var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
				chart.draw(data, options);


				data = google.visualization.arrayToDataTable(params.result.diffList);

				options = {
				  title: 'Difficulty',
				  legend: {position: 'none'},
				  height: 400,
				  vAxis: {minValue: 0}
				};

				var chartDiff = new google.visualization.AreaChart(document.getElementById('chart_diff_div'));
				chartDiff.draw(data, options);

			    console.log(params.result.btcSum);
			    var res_str = params.result.btcSum.toFixed(6) + ' ' + base_crypto;
			    if (params.inputCurrency != 'BASE_CURR')
			    { 
			    	res_str += ' = ' + (params.result.btcSum*params.inputCurrencyRate).toFixed(0) + ' ' + params.inputCurrency;
				}
			    $("#result").text(res_str);
			    $("#resultDiffTime").text(params.result.timeDiff + ' days')
    	};

    	var update_curr_rate = function(){

	    	var c = $("#inputCurrency").val();
	    	var rate = 1;
	    	$("#rateControl").show();
	    	if (c == 'USD')
	    	{
	    		rate = stats['market_price_usd'];
	    	}
	    	else if (c == 'RUR')
	    	{
	    		rate = stats['market_price_usd'] * 35;
	    	}
	    	else if (c == 'EUR')
	    	{
	    		rate = stats['market_price_usd'] / 1.369;
	    	}
	    	else if (c == 'CNY')
	    	{
	    		rate = stats['market_price_usd'] * 6.08339;
	    	}
	    	else if (c == 'BTC')
	    	{
	    		rate = stats.btc_price;
	    	}
	    	else
	    	{
	    		$("#rateControl").hide();
	    	}

	    	$("#inputCurrencyRate").val(rate);
    	};

    	var change_crypto = function(crypto){
    		if (crypto == undefined)
    		{
    			base_crypto = location.hash.replace("#","");
    			if (base_crypto == '')
    			{
    				base_crypto = 'BTC';
    			}
    		}
    		else
			{
				base_crypto = crypto;
			}
    		console.log(base_crypto);

			if (base_crypto == 'BTC')
			{
				stats = btc_stats;
				stats.reward_halved_blocks = 210000;
				stats.diff_history = [1418481395.2626355, 1789546951.0532405, 2193847870.174279, 2621404453.0646152, 3129573174.5222874];
				stats.minutes_between_blocks_normal = 10;
				stats.blocks_between_recalc = 2016;
			}
			else// if (base_crypto == 'LTC')
			{
				stats = get_crypto_stats(base_crypto);
			}

	    	var diffInc_history	= getDiffIncrice(stats.diff_history);
	    	var use_last_n = 3;
	    	var diffInc_aver = getDiffIncriceAver(diffInc_history, use_last_n);
	    	// var nextDiff = getNextDiff(stats['difficulty'], stats['n_blocks_total'], stats['minutes_between_blocks'], blocks_between_recalc, minutes_between_blocks_normal);

	     	$("#inputDifficulty").val(stats.difficulty.toFixed(2));
	     	$("#inputDifficultyIncrement").val(diffInc_aver * 100);
	     	$("#base_curr").text(base_crypto);
	     	if (base_crypto == 'BTC'){
	     		$("#inputCurrency_btc_option").remove();
	     	}
	     	else if ($("#inputCurrency_btc_option").length == 0){
	     		$("#inputCurrency").append('<option id="inputCurrency_btc_option" value="BTC">BTC</option>');
	     	}
	     	update_curr_rate();
	    	calc();
	    };


     $(document).ready(function(){

    	var btc_url = 'http://xn--90aoahqe0a.xn--p1ai/bitcoin_stats.php?url=https://blockchain.info/ru/stats?format=json';
    	var coins_url = 'http://xn--90aoahqe0a.xn--p1ai/bitcoin_stats.php?url=http://www.coinchoose.com/api.php?base=BTC';
    	$.getJSON( btc_url, function( data ) {
    		if (data['status']['http_code'] == 200)
    		{
    			btc_stats = data['contents'];
    		}
		});

    	$.getJSON( coins_url, function( data ) {
    		if (data['status']['http_code'] == 200)
    		{
    			coins_stats = data['contents'];
				var scrypt_list = $('#crypto_coins_scrypt');
				scrypt_list.empty();
				var sha_list = $('#crypto_coins_sha');
				sha_list.empty();

				$.each(coins_stats, function(key, value) { 
					// if (value.networkhashrate <= 0)
					// {
     // 					console.log('Not valid networkhashrate', value.symbol, value.name, value.algo);
					// }
					// else
					// {
						if (value.algo == "scrypt")
						{
	     					scrypt_list.append('<li><a href="#' + value.symbol +'">'+value.name+'</a></li>');
	     				}
	     				else if (value.algo == "SHA-256")
						{
	     					sha_list.append('<li><a href="#' + value.symbol +'">'+value.name+'</a></li>');
	     				}
	     				else
	     				{
	     					console.log(value.symbol, value.name, value.algo);
	     				}
	     			// }
				});

				// $.each($("#crypto_coins li a"), function(key, value){
					// console.log(key, value);
					// value.click(function(){
//						var crypto = location.hash.replace("#","");
					// 	change_crypto();
					// });
				// })
				change_crypto();
    		}
		});

     	$("#bitcoin_on").click(function() {
     		location.hash = '#BTC';
			// change_crypto('BTC');
		});

     	$("#litecoin_on").click(function() {
     		location.hash = '#LTC';
			// change_crypto('LTC');
		});

		$('#calculator-form form :input').each(function() {
			// var id = $(this).attr('id');
			// var val = $(this).val();
			$(this).change(function(event) {
				calc();
			});
		});

     	// change_crypto();

	    $("#inputCurrency").change(function(event) {
	    	update_curr_rate();
	    	calc();
	    }).change();

	    $(window).on('hashchange', function() {
	    	change_crypto();
	    });
 });
/*$.get( "https://blockchain.info/ru/stats?format=json", function( data ) {
	var diff = data['difficulty'];
	console.log(diff);
  $( "#difficulty" ).value = diff;
});*/
