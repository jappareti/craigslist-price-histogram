import { select } from "d3-selection";
import { initChart, addCreateChartBtn } from "./price-graph";

const d3 = { select };
const bodyClassList = document.querySelector("body").classList;

if (bodyClassList.contains("search")) {
  const priceFilterDiv = d3.select(".minmax");
  const createChartBtn = addCreateChartBtn(priceFilterDiv);
  createChartBtn.on("click", function() {
    createChartBtn.classed("clicked", true);
    initChart();
  });
}
