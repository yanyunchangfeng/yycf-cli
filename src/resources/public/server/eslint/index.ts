// const baseColor = ['#25859e', '#6acece', '#e78816', '#eabc7f', '#12619d', '#ad2532', '#15938d', '#b3aa9b', '#042d4c'];

// const genColor = (arrLength: number): string[] => {
//   const color: string[] = [];
//   for (let i = 0; i < arrLength; i++) {
//     color[i] = baseColor[i % baseColor.length];
//   }
//   return color;
// };

const baseColor = [
  'rgba(37, 133, 158, 0.7)',
  'rgba(106, 206, 206, 0.7)',
  'rgba(231, 136, 22, 0.7)',
  'rgba(234, 188, 127, 0.7)',
  'rgba(18, 97, 157, 0.7)',
  'rgba(173, 37, 50, 0.7)',
  'rgba(21, 147, 141, 0.7)',
  'rgba(179, 170, 155, 0.7)',
  'rgba(4, 45, 76, 0.7)'
];

const genColor = (arrLength: number): string[] => {
  const color: string[] = [];
  for (let i = 0; i < arrLength; i++) {
    const baseIndex = i % baseColor.length;
    const opacity = 0.5 + 0.2 * (i % 2); // 通过透明度区分
    const rgbaColor = baseColor[baseIndex].replace('0.7', opacity.toString());
    color[i] = rgbaColor;
  }
  return color;
};
interface ESLintMessage {
  ruleId: string;
  severity: number;
  message: string; // 添加 message 属性
  line: number; // 添加行号
  column: number; // 添加列号
}

interface ESLintResult {
  filePath: string;
  messages: ESLintMessage[];
}
const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};
const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: any) => b.lines);

    const tableHead = document.createElement('thead');

    titleLines.forEach((title: any) => {
      const tr: any = document.createElement('tr');
      tr.style.borderWidth = 0;

      const th: any = document.createElement('th');
      th.style.borderWidth = 0;
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body: any, i: any) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';

      const tr: any = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = 0;

      const td: any = document.createElement('td');
      td.style.borderWidth = 0;

      const text = document.createTextNode(body);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

fetch('report.json')
  .then((response) => response.json())
  .then((data: ESLintResult[]) => {
    let totalErrors = 0;
    let totalWarnings = 0;

    data.forEach((result) => {
      result.messages.forEach((message) => {
        if (message.severity === 2) {
          totalErrors++;
        } else if (message.severity === 1) {
          totalWarnings++;
        }
      });
    });
    const filePaths = [...new Set(data.map((result) => result.filePath))]; // 提取所有文件名
    const ruleIds = [...new Set(data.flatMap((result) => result.messages.map((msg) => msg.ruleId)))]; // 提取所有规则ID
    const totalErrorsList = filePaths.map((filePath) => {
      const fileResult = data.find((result) => result.filePath === filePath);
      return fileResult?.messages.filter((msg) => msg.severity === 2).length || 0;
    });
    const totalWarningsList = filePaths.map((filePath) => {
      const fileResult = data.find((result) => result.filePath === filePath);
      return fileResult?.messages.filter((msg) => msg.severity === 1).length || 0;
    });
    const datasets = [
      {
        label: 'Errors',
        data: totalErrorsList,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        hoverBackgroundColor: '#ffcc00',
        hoverBorderColor: '#ff9900'
      },
      {
        label: 'Warnings',
        data: totalWarningsList,
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2,
        hoverBackgroundColor: '#ffcc00',
        hoverBorderColor: '#ff9900'
      },
      ...ruleIds.map((ruleId, index) => {
        const counts = filePaths.map((filePath) => {
          const fileResult = data.find((result) => result.filePath === filePath);
          return fileResult?.messages.filter((msg) => msg.ruleId === ruleId).length || 0;
        });
        return {
          label: ruleId,
          data: counts,
          backgroundColor: genColor(counts.length), // 使用渐变色数组
          borderColor: baseColor[index % baseColor.length],
          borderWidth: 2,
          hoverBackgroundColor: '#ffcc00', // 悬停时的背景颜色
          hoverBorderColor: '#ff9900' //
        };
      })
    ];
    const eslint = document.getElementById('reportChart') as HTMLCanvasElement;
    const ctx = eslint.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filePaths,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            stacked: true,
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              callback: function (_: any, index: number) {
                return index;
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Total Errors: ${totalErrors} | Total Warnings: ${totalWarnings}`,
            color: '#000',
            font: {
              size: 16
            },
            padding: {
              top: 10,
              bottom: 10
            }
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems: any) => {
                const index = tooltipItems[0].dataIndex;
                return filePaths[index];
              },
              afterLabel: (tooltipItem: any) => {
                const ruleId = tooltipItem.dataset.label; // 当前规则 ID
                const filePath = filePaths[tooltipItem.dataIndex]; // 当前文件路径
                const fileResult = data.find((result) => result.filePath === filePath);
                const messages = fileResult?.messages.filter((msg) => msg.ruleId === ruleId) || [];
                if (ruleId === 'Errors' || ruleId === 'Warnings') {
                  return '';
                }
                if (messages.length > 0) {
                  // 生成详细的错误消息
                  return messages
                    .map(
                      (msg) =>
                        `Line ${msg.line}: Column ${msg.column} ${msg.severity === 2 ? 'Error' : 'Warning'}: ${
                          msg.message
                        }`
                    )
                    .join('\n');
                } else {
                  return `Rule: ${ruleId}, Severity: 0`; // 若没有错误，则显示规则 ID 和数量为 0
                }
              }
            },
            // enabled: false,
            position: 'nearest',
            // external: externalTooltipHandler,
            // 增加最大宽度和滚动功能
            displayColors: false,
            bodySpacing: 5,
            footerSpacing: 5,
            boxWidth: 10,
            bodyFont: {
              size: 10
            },
            footerFont: {
              size: 10
            },
            titleFont: {
              size: 12,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top', // 图例位置
            labels: {
              usePointStyle: true, // 使用点样式
              boxWidth: 12, // 图例项的宽度
              padding: 20 // 图例与图表的间距
            }
          }
        }
      }
    });
  })
  .catch((error) => console.error('Error fetching ESLint data:', error));
export {};
