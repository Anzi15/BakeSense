import { DonutChart } from '@shopify/polaris-viz';

export default function ProductionChart() {
  return (
    <div
      style={{
        height: 400,
        width: 550,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}  
    >
      <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
        🏭 Production Breakdown
      </h2>
      <DonutChart
        comparisonMetric={{
          accessibilityLabel: 'total production',
          metric: '100%',
          trend: 'neutral',
        }}
        data={[
          {
            data: [{ key: 'January', value: 50000 }],
            name: 'Bread 🍞',
            color: '#ffcc00',
          },
          {
            data: [{ key: 'January', value: 25000 }],
            name: 'Cakes 🎂',
            color: '#ff6699',
          },
          {
            data: [{ key: 'January', value: 15000 }],
            name: 'Pastries 🥐',
            color: '#66ccff',
          },
          {
            data: [{ key: 'January', value: 10000 }],
            name: 'Cookies 🍪',
            color: '#ff9966',
          },
        ]}
        legendPosition="left"
      />
    </div>
  );
}
