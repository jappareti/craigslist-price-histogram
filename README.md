# About

Injects an interactive price histogram filter for Craigslist searches.

![Craigslist Price Histogram Screenshot](screenshot.png?raw=true)

## Why

While searching for goods, housing, etc. on Craigslist it can be difficult to
understand what the market looks like. This extension gives valueable insight in
the price distribution of the market for a given product.

## Installing

First clone the repo and install the dependencies with `yarn install` or `npm install`:

```sh
git clone git@github.com:jappareti/craigslist-price-histogram.git
cd craigslist-price-histogram
yarn install
```

To build for development and watch for changes, run:

```sh
yarn run dev
```

Add the build folder `./dist` to Google Chrome:

- In Chrome, navigate to `chrome://extensions`
- Make sure **Developer Mode** is toggled on in the top right.
- Click on **Load unpacked**
- Navigate to the `craigslist-price-histogram` folder on your computer
- Select the `dist` folder

Now, navigate to your local craigslist website and run a search query. For
example, here's a search page for all of the 1 bedroom apartments available in
San Francisco:

[https://sfbay.craigslist.org/search/apa?search_distance=4&postal=94117&min_bedrooms=1&max_bedrooms=1&availabilityMode=0&sale_date=all+dates](https://sfbay.craigslist.org/search/apa?search_distance=4&postal=94117&min_bedrooms=1&max_bedrooms=1&availabilityMode=0&sale_date=all+dates)

To build for production and deployment, run:

```sh
yarn run prod
```

## Issues

- Sometimes the first time you click "Create Price Graph" it gets stuck on
  loading. If this happens, try refreshing the page. I'm working on a fix for
  this.
- How to handle outliers. Sometimes the poster mis-types the price which throws
  off the distribution. For instance, one time I found a 1 bedroom apartment
  available for $24,909, but what they probably meant was $2,499
- How to handle duplicates. The duplicate listings skew the histogram because
  they add duplicate data. Ideally the data from CL would be
  duplicate-free, but that's rarely the case. Fixing this would involve
  duplicate-detection and removing them from the price list that is used to
  build the histogram.
