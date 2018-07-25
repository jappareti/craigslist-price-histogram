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
const width = 200;
const margin = { top: 0, right: 10, bottom: 0, left: 12 };
const container = d3.select(".minmax");

function initChart() {
  d3.json("response.json").then(function(d) {
    const data = d[0].filter(d => d.hasOwnProperty("Ask")).map(d => d.Ask);

    // Add average label
    const avg = _
      .mean(data)
      .toLocaleString("en-US", { style: "currency", currency: "USD" });
    container
      .append("p")
      .append("em")
      .attr("class", "avg")
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "11px")
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

    const svg = container
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
    let minLinePos = bins[0].x0;
    let maxLinePos = bins[bins.length - 1].x1;

    const minLine = svg
      .append("line")
      .style("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("x1", x(minLinePos))
      .attr("x2", x(minLinePos))
      .attr("y1", y(0))
      .attr("y2", y(height));

    const maxLine = svg
      .append("line")
      .style("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("x1", x(maxLinePos))
      .attr("x2", x(maxLinePos))
      .attr("y1", y(0))
      .attr("y2", y(height));

    // Add the range slider
    const stepSize = bins[0].x1 - bins[0].x0; // get the first bin size
    container
      .append("div")
      .style("width", width - margin.right)
      .attr("id", "slider");
    const slider = document.getElementById("slider");
    noUiSlider.create(slider, {
      start: [minLinePos, maxLinePos],
      connect: true,
      // tooltips: true,
      step: stepSize,
      range: {
        min: minLinePos,
        max: maxLinePos
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
    const minInput = container.select("[name=min_price]");
    const maxInput = container.select("[name=max_price]");

    // Update the input values when the slider changes
    slider.noUiSlider.on("update", function(values, handle) {
      // Lower bound handle is 0
      const value = parseInt(values[handle].replace("$", ""));

      if (handle === 0) {
        minLinePos = value - stepSize;
        minInput.attr("value", value); // update the price input
        minLine.attr("x1", x(minLinePos) - 0.5).attr("x2", x(minLinePos) - 0.5); // move the vertical line
      } else {
        maxLinePos = value + stepSize;
        maxInput.attr("value", value);
        maxLine.attr("x1", x(maxLinePos) + 0.5).attr("x2", x(maxLinePos) + 0.5);
      }
      // update fill color on bars
      bar.attr("fill", d => {
        if (d.x1 <= minLinePos || d.x0 >= maxLinePos) {
          return "hsl(0, 0%, 92%)";
        }
      });
    });
  });
}

initChart();
