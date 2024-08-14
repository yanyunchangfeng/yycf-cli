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

fetch('/report')
  .then((response) => response.json())
  .then((data) => {
    const ruleCounts: any = {};
    data.forEach((result: any) => {
      result.messages.forEach((message: any) => {
        if (ruleCounts[message.ruleId]) {
          ruleCounts[message.ruleId]++;
        } else {
          ruleCounts[message.ruleId] = 1;
        }
      });
    });

    const labels = Object.keys(ruleCounts);
    const counts = Object.values(ruleCounts);
    const colors = genColor(counts);
    const eslint = <HTMLCanvasElement>document.getElementById('eslintChart');
    const ctx = eslint.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'ESLint Errors and Warnings by Rule',
            data: counts,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true, // 图表响应容器大小
        maintainAspectRatio: false, // 不保持默认宽高比
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
export {};
