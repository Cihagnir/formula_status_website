


// Calculate the upper and lower quartiles from array
function Quartile_Calculater(input_array, lower_filter_rate = 1.5, upper_filter_rate = 1.5) {

  input_array.sort(function (a, b) { return a - b });

  let data_first_quartile = input_array[Math.floor((input_array.length + 1) * 0.25)];
  let data_third_quartile = input_array[Math.floor((input_array.length + 1) * 0.75)];

  let data_iqr = data_third_quartile - data_first_quartile

  let outliers_lower_limit = data_first_quartile - data_iqr * lower_filter_rate;
  let outliers_upper_limit = data_third_quartile + data_iqr * upper_filter_rate;

  return { upper_quart : outliers_upper_limit, lower_quart : outliers_lower_limit }

}




module.exports = {
  Quartile_Calculater
};

