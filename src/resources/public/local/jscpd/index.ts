const baseColor = ['#25859e', '#6acece', '#e78816', '#eabc7f', '#12619d', '#ad2532', '#15938d', '#b3aa9b', '#042d4c'];
const genColor = (arr: any) => {
  let num = 0;
  let color: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (num < baseColor.length) {
      color[i] = baseColor[num++];
    } else {
      num = 0;
      color[i] = baseColor[num++];
    }
  }
  return color;
};

function createChart(
  ctx: CanvasRenderingContext2D,
  type: string,
  labels: string[],
  data: number[],
  label: string,
  backgroundColors: string[],
  borderColors: string[]
): void {
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: false
      },
      scales:
        type === 'bar'
          ? {
              y: {
                beginAtZero: true
              },
              x: {
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10, // 限制最大显示的标签数量
                  callback: function (value: any, index: any, values: any) {
                    return index;
                  }
                }
              }
            }
          : {}
    }
  });
}

fetch('report.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    const typescriptSources = data.statistics.formats.typescript?.sources || {};
    const tsxSources = data.statistics.formats.tsx?.sources || {};
    // 合并两种格式的文件
    const allSources = { ...typescriptSources, ...tsxSources };
    const files = Object.keys(allSources);
    const tokens = files.map((file) => allSources[file].tokens);
    const duplicatedLines = files.map((file) => allSources[file].duplicatedLines);
    const percentages = files.map((file) => allSources[file].percentage);
    const duplicatedTokens = files.map((file) => allSources[file].duplicatedTokens);

    const hasData = !percentages.every((value) => value === 0);

    const colors = genColor(files);
    // 创建标记数的柱状图
    const tokensCtx = document.getElementById('tokensChart') as HTMLCanvasElement;
    createChart(
      tokensCtx.getContext('2d') as CanvasRenderingContext2D,
      'bar',
      files,
      tokens,
      'Tokens Count',
      colors,
      colors
    );

    // 创建重复行数的柱状图
    const duplicatedLinesCtx = document.getElementById('duplicatedLinesChart') as HTMLCanvasElement;
    createChart(
      duplicatedLinesCtx.getContext('2d') as CanvasRenderingContext2D,
      'bar',
      files,
      duplicatedLines,
      'Duplicated Lines',
      colors,
      colors
    );

    // 创建重复行数百分比的饼图
    const percentageCtx = document.getElementById('percentageChart') as HTMLCanvasElement;
    createChart(
      percentageCtx.getContext('2d') as CanvasRenderingContext2D,
      'pie',
      hasData ? files : ['No Data'],
      hasData ? percentages : [1],
      'Duplicated Lines Percentage',
      colors,
      colors
    );

    // 创建重复标记数的柱状图
    const duplicatedTokensCtx = document.getElementById('duplicatedTokensChart') as HTMLCanvasElement;
    createChart(
      duplicatedTokensCtx.getContext('2d') as CanvasRenderingContext2D,
      'bar',
      files,
      duplicatedTokens,
      'Duplicated Tokens',
      colors,
      colors
    );
  });
export {};
