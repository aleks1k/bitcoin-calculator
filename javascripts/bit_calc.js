		google.load("visualization", "1", {packages:["corechart"]});

    	// https://blockchain.info/ru/stats?format=json
    	var stats = {"trade_volume_btc":20558.38042413,"electricity_consumption":4.247113588840637E8,"miners_revenue_usd":2449088.42178,"n_btc_mined":437500000000,"trade_volume_usd":1.1471700038114693E7,"difficulty":3.1295731745222874E9,"minutes_between_blocks":8.228571428571428,"days_destroyed":0.0,"n_tx":70705,"hash_rate":2.7225087107952803E7,"timestamp":1392914289855,"n_blocks_mined":175,"blocks_size":40505389,"total_fees_btc":1457429764,"miners_operating_margin":-2501.0,"total_btc_sent":48200321939415,"estimated_btc_sent":9418058124214,"totalbc":1237927500000000,"electricity_cost_usd":6.370670383260956E7,"n_blocks_total":286903,"nextretarget":288287,"estimated_transaction_volume_usd":5.25533313002132E7,"miners_revenue_btc":4389,"market_price_usd":558.00602};

    	var diff_history = [1418481395.2626355, 1789546951.0532405, 2193847870.174279, 2621404453.0646152, 3129573174.5222874];

    	var blocks_between_recalc = 2016;

    	var diffInc_history	= [];
    	var diffInc_aver = 0;
    	var use_last_n = 3;
    	for (var i=diff_history.length-1;i>diff_history.length-1-use_last_n;i--)
		{
			var diffInc = (diff_history[i] - diff_history[i-1]) / diff_history[i-1];
			diffInc_aver += diffInc;
			diffInc_history.push(diffInc);
			console.log(diffInc);
		}
		diffInc_aver /= use_last_n;

		diffInc_aver = diffInc_aver.toFixed(3);

		var calc_profit = function(diff, hashrate, time, block_reward, poolFee, elBtcCostPerSecond)
		{
			return ( block_reward * time / diff * hashrate / Math.pow(2, 32) ) * (1 - poolFee) - elBtcCostPerSecond * time;
		};

    	var calc = function()
    	{
			var hashrate = $("#inputHashrate").val();
			    var hashrate_level = $("#hashrate_level").val();
			    var diff = Number($("#difficulty").val());
			    var diffInc = $("#difficultyIncrement").val() / 100;

			    var poolFee = $("#poolFee").val() / 100;
			    var hardwarePower = $("#hardwarePower").val();
			    var electricityPrice = $("#electricityPrice").val(); //usd
			    var rate = 630;
			    var elBtcCostPerSecond = hardwarePower / 1000 * electricityPrice / rate / 60 / 60;

			    var start_date = Date.parse($("#startdate").val())
			    if (!isNaN(start_date))
		    	{
		    		start_date /= 1000;
		    	}
			    var end_date = Date.parse($("#enddate").val());
			    if (!isNaN(end_date))
		    	{
		    		end_date /= 1000;
		    	}
			    console.log(start_date, end_date);


			    var n_blocks_total = stats['n_blocks_total'];
			    var block_reward = 50 * Math.pow(0.5, Math.floor(n_blocks_total / 210000));
			    var minutes_between_blocks = stats['minutes_between_blocks'];
			    var all_hashrate = diff * Math.pow(2, 32) / ( minutes_between_blocks * 60 ) / 1e12;
			    var blocks_left = blocks_between_recalc - n_blocks_total % blocks_between_recalc;
			    var next_diff_time_left = 0.5 * blocks_left * (minutes_between_blocks * 60 + (10 * 60 / (1 + diffInc)));

			    console.log(hashrate, diff, block_reward, all_hashrate, blocks_left, next_diff_time_left);

			    var profit_list = [];
			    var curr_diff = diff;	
			    var nowtime = stats['timestamp'] / 1000;
			    var curr_time = nowtime + next_diff_time_left;
			    if (isNaN(start_date) || nowtime > start_date)
			    {
			    	start_date = NaN;
			    }
			    else if (curr_time < start_date)
			    {
			    	next_diff_time_left = 0;
			    }
			    else
			    {
			    	profit_list.push({date: new Date(nowtime * 1000), diff: curr_diff, profit: 0, result: 0});
			    	profit_list.push({date: new Date(start_date * 1000), diff: curr_diff, profit: 0, result: 0});
			    	next_diff_time_left = curr_time - start_date;
			    }

			    var result = 0;
			    var profit = calc_profit(diff, hashrate * hashrate_level, next_diff_time_left, block_reward, poolFee, elBtcCostPerSecond);

			    var n_blocks = Math.ceil(n_blocks_total / blocks_between_recalc);

			    if (profit != 0)
				{
					result += profit;
				    profit_list.push({date: new Date(curr_time * 1000), diff: curr_diff, profit: result, result: result});
				}
			    console.log(curr_time, next_diff_time_left, curr_diff, result);
			    var step = 0;
			    var stop = false;
			    do
			    {
			    	curr_diff *= 1 + diffInc;
				    var block_reward = 50 * Math.pow(0.5, Math.floor(n_blocks_total / 210000));
				    var diff_time = 0.5 * blocks_between_recalc * (10 * 60 * (1 + 1/(1 + diffInc)));
			    	n_blocks += blocks_between_recalc;

				    if (isNaN(start_date) || curr_time > start_date)
				    {
				    	start_date = NaN;
				    }
				    else if ( (curr_time + diff_time) < start_date )
				    {
				    	curr_time += diff_time;
				    	profit_list.push({date: new Date(curr_time * 1000), diff: curr_diff, profit: 0, result: 0});
				    	continue;
				    	diff_time = 0;
				    }
				    else
				    {
				    	profit_list.push({date: new Date(start_date * 1000), diff: curr_diff, profit: 0, result: 0});
				    	diff_time = (curr_time + diff_time) - start_date;
				    	curr_time = start_date;
				    }

				    if (!isNaN(end_date) && (curr_time + diff_time) > end_date)
				    {
				    	diff_time = end_date - curr_time;
				    	stop = true;
					}
				    curr_time += diff_time;
			    	var profit = calc_profit(curr_diff, hashrate * hashrate_level, diff_time, block_reward, poolFee, elBtcCostPerSecond);
			    	if (profit <= 1e-6)
			    		break;
			    	result += profit;
			    	console.log(curr_time, diff_time/60/60/24, curr_diff, profit, result);
				    profit_list.push({date: new Date(curr_time * 1000), diff: curr_diff, profit: profit, result: result});
				    step += 1;
			    } while(step < 100 && !stop);
			    
			    $('ul.mylist').empty();
			    var cList = $('ul.mylist');
				var li = $('<li/>')
					.addClass('ui-menu-item')
					.attr('role', 'menuitem')
					.appendTo(cList);
				var aaa = $('<b/>')
					.addClass('ui-all')
					.text('Profit, Result, Date')
					.appendTo(li);

			    var chartArray = [['Date', 'Profit', 'Result']];
			    var chartDiffArray = [['Date', 'Difficulty']];
			    var prevDate = new Date(stats['timestamp']);
			    // var prevDiff = stats['difficulty'];
			    // chartDiffArray.push([, prevDiff]);
			    chartArray.push([prevDate, 0, 0]);
				$.each(profit_list, function(i)
				{
				    var li = $('<li/>')
				        .addClass('ui-menu-item')
				        .attr('role', 'menuitem')
				        .appendTo(cList);
				    var datetime = profit_list[i]['date'];
				    var dateStr = datetime.getDate() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getFullYear();
				    var aaa = $('<i/>')
				        .addClass('ui-all')
				        .text(profit_list[i]['profit'].toFixed(6) + ', ' + profit_list[i]['result'].toFixed(6) + ', ' + dateStr )
				        .appendTo(li);
			    	chartArray.push([profit_list[i]['date'], profit_list[i]['profit'], profit_list[i]['result']]);
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
				  height: 400,
				  vAxis: {title: 'BTC',  titleTextStyle: {color: '#333'}, minValue: 0}
				};
				if (!isNaN(start_date))
				{
					options['hAxis'] = {minValue: new Date(start_date*1000)};
				}

				var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
				chart.draw(data, options);


				data = google.visualization.arrayToDataTable(chartDiffArray);

				options = {
				  title: 'Difficulty',
				  height: 400,
				  vAxis: {minValue: 0}
				};

				var chartDiff = new google.visualization.AreaChart(document.getElementById('chart_diff_div'));
				chartDiff.draw(data, options);

			    console.log(result);
			    $("#result").text(result.toFixed(6));
    	};

     $(document).ready(function(){
     	$("#difficulty").val(stats['difficulty'].toFixed(2));
     	$("#difficultyIncrement").val(diffInc_aver*100);

    $("#inputHashrate").change(function(event) {
    	calc();
    }).change();

    $("#hashrate_level").change(function(event) {
    	calc();
    });
    $("#difficulty").change(function(event) {
    	calc();
    });
    $("#difficultyIncrement").change(function(event) {
    	calc();
    });
    $("#poolFee").change(function(event) {
    	calc();
    });	
    $("#electricityPrice").change(function(event) {
    	calc();
    });
    $("#hardwarePower").change(function(event) {
    	calc();
    });
    $("#startdate").change(function(event) {
    	calc();
    });
    $("#enddate").change(function(event) {
    	calc();
    });
 });
/*$.get( "https://blockchain.info/ru/stats?format=json", function( data ) {
	var diff = data['difficulty'];
	console.log(diff);
  $( "#difficulty" ).value = diff;
});*/
