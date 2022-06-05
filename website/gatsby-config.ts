import type { GatsbyConfig } from 'gatsby';

require('dotenv').config({ path: '.env' });

const config: GatsbyConfig = {
    siteMetadata: {
        title: `My Gatsby Site`,
        siteUrl: `https://www.yourdomain.tld`,
    },
    plugins: ['gatsby-plugin-postcss'],
};

export default config;
