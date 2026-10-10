import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as echarts from 'echarts';
import HomePage from '@/app/page';
import { AppProviders } from '@/components/app-providers';

describe('bootstrap integrations', () => {
  it('renders the homepage through the MUI and Next.js providers without credentials', () => {
    const html = renderToStaticMarkup(
      <AppProviders>
        <HomePage />
      </AppProviders>,
    );
    expect(html).toContain('个人资金管理');
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
  });

  it('can render ECharts SVG without a browser or database', () => {
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 320,
      height: 200,
    });
    try {
      chart.setOption({
        xAxis: { data: ['test'] },
        yAxis: {},
        series: [{ type: 'bar', data: [1] }],
      });
      expect(chart.renderToSVGString()).toContain('<svg');
    } finally {
      chart.dispose();
    }
  });
});
