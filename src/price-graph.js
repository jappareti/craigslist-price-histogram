import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { select, selectAll } from "d3-selection";
import { json } from "d3-fetch";
import { extent, histogram, min, max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { mean } from "lodash";
import noUiSlider from "nouislider";
import "nouislider/distribute/nouislider.css";
import "./nouislider-overrides.css";
import "./main.css";

const d3 = {
  scaleLinear,
  line,
  select,
  selectAll,
  json,
  extent,
  histogram,
  min,
  max,
  axisBottom,
  axisLeft
};

const _ = { mean };
const height = 70;
const width = 171;
const margin = { top: 0, right: 5, bottom: 0, left: 5 };

async function getData(path) {
  let searchParams = "";
  if (window.location.search) {
    searchParams = path.match(/\?.*/)[0].replace("?", "&");
  }
  const firstResult = await d3.json(path).then(result => result);
  let prices = firstResult[0]
    .filter(d => d.hasOwnProperty("Ask") && d.Ask !== "")
    .map(d => d.Ask);
  const clusters = firstResult[0]
    .filter(d => d.hasOwnProperty("url"))
    .map(d => d.url);

  if (clusters.length > 0) {
    const clusterPromises = clusters.map(cluster =>
      getData(cluster + searchParams)
    );
    const clusterPrices = await Promise.all(clusterPromises)
      .then(values => values)
      .catch(console.error);
    return [...prices, ...clusterPrices.flat()];
  } else {
    return prices;
  }
}

function addCreateChartBtn(chartDiv) {
  const chartBtn = chartDiv
    .append("a")
    .attr("class", "create-price-chart-btn")
    .attr(
      "title",
      "Create a price chart graph. This link was injected by the Craigslist Price Chart Extension."
    )
    .text("create price chart");
  return chartBtn;
}

function addBlankChartContainer(priceFilterDiv) {
  const chartDiv = priceFilterDiv
    .append("div")
    .attr("class", "cl-extension-chart loading");

  chartDiv
    .append("p")
    .attr("class", "loading")
    .append("em")
    .text("Loading price graph...");

  return chartDiv;
}

function getCleanedJsonUrl(url) {
  return (
    url
      .replace("search", "jsonsearch")
      .replace("apa/", "apa?")
      .replace(/&(min_price)=\d*/, "")
      .replace(/&(max_price)=\d*/, "") + "&map=1"
  );
}

async function initChart() {
  const priceFilterDiv = d3.select(".minmax");
  const chartDiv = addBlankChartContainer(priceFilterDiv);

  const url = window.location.href;
  const jsonUrl = getCleanedJsonUrl(url);
  const minPriceValue = url.match(/(min_price=)(\d*)/);
  const maxPriceValue = url.match(/(max_price=)(\d*)/);

  const priceData = await getData(jsonUrl)
    .then(data => data)
    .catch(error => console.log(error));

  updateChart(
    priceData,
    chartDiv,
    priceFilterDiv,
    minPriceValue,
    maxPriceValue
  );
}

function updateChart(
  data,
  chartDiv,
  priceFilterDiv,
  minPriceValue,
  maxPriceValue
) {
  chartDiv.classed("loading", false);
  // Add average label
  const avg = _
    .mean(data)
    .toLocaleString("en-US", { style: "currency", currency: "USD" });
  chartDiv
    .append("p")
    .attr("class", "avg")
    .append("em")
    .text(`Average price ${avg}`);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data))
    .nice()
    .range([margin.left, width - margin.right]);

  const bins = d3
    .histogram()
    .domain(x.domain())
    .thresholds(x.ticks(29))(data);

  const svg = chartDiv
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const bar = svg
    .append("g")
    .attr("fill", "rgba(190, 179, 255, 0.6)")
    .selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x0))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0)))
    .attr("y", d => y(d.length))
    .attr("height", d => y(0) - y(d.length));

  // Add the min and max vertical lines
  let minLinePos = minPriceValue ? parseInt(minPriceValue[2]) : bins[0].x0;
  let maxLinePos = maxPriceValue
    ? parseInt(maxPriceValue[2])
    : bins[bins.length - 1].x1;

  const minLine = svg
    .append("line")
    .style("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("x1", x(minLinePos))
    .attr("x2", x(minLinePos))
    .attr("y1", 0)
    .attr("y2", height);

  const maxLine = svg
    .append("line")
    .style("stroke", "orange")
    .attr("stroke-width", 1)
    .attr("x1", x(maxLinePos))
    .attr("x2", x(maxLinePos))
    .attr("y1", 0)
    .attr("y2", height);

  // Add the range slider
  const stepSize = bins[0].x1 - bins[0].x0; // get the first bin size
  chartDiv
    .append("div")
    .style("width", width - margin.right)
    .attr("id", "slider");
  const slider = document.getElementById("slider");
  noUiSlider.create(slider, {
    start: [minLinePos, maxLinePos],
    connect: true,
    margin: stepSize,
    step: stepSize,
    range: {
      min: bins[0].x0,
      max: bins[bins.length - 1].x1
    },
    format: {
      to: function(value) {
        return `$${Math.round(value)}`;
      },
      from: function(value) {
        return value.replace("$", "");
      }
    }
  });

  // Get min and max price inputs
  const minInput = priceFilterDiv.select("[name=min_price]");
  const maxInput = priceFilterDiv.select("[name=max_price]");

  // Update the input values when the slider changes
  slider.noUiSlider.on("update", function(values, handle) {
    // Lower bound handle is 0
    const value = parseInt(values[handle].replace("$", ""));

    if (handle === 0) {
      minLinePos = value > 0 ? value - stepSize : 0;
      minInput.attr("value", minLinePos); // update the price input
      minLine.attr("x1", x(minLinePos) - 0.5).attr("x2", x(minLinePos) - 0.5); // move the vertical line
    } else {
      maxLinePos = value;
      maxInput.attr("value", maxLinePos);
      maxLine.attr("x1", x(maxLinePos) + 0.5).attr("x2", x(maxLinePos) + 0.5);
    }
    // update fill color on bars
    bar.attr("fill", d => {
      if (d.x1 <= minLinePos || d.x0 >= maxLinePos) {
        return "hsl(0, 0%, 92%)";
      }
    });
  });
}

export { getData, initChart, addBlankChartContainer, addCreateChartBtn };
