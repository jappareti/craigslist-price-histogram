# About

Injects an interactive price histogram filter for Craigslist searches.

## Why

While searching for goods, housing, etc. on Craigslist it can be difficult to
understand what the market looks like. This extension gives valueable insight in
the price distribution of the market for a given product.

## Issues

- How to handle outliers
- How to handle duplicates. The duplicate listings skew the histogram. Ideally the data from CL would be
  duplicate-free, but that's rarely the case. Fixing this would involve
  duplicate-detection, which is a feature in itself.
