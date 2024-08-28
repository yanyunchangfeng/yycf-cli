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
