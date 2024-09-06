const baseColor = ['#25859e', '#6acece', '#e78816', '#eabc7f', '#12619d', '#ad2532', '#15938d', '#b3aa9b', '#042d4c'];
const randomColor = () => {
  return baseColor[Math.floor(Math.random() * baseColor.length)];
};
// 定义 JSON 数据的类型
interface HalsteadMetrics {
  bugs: number;
  difficulty: number;
  effort: number;
  length: number;
  time: number;
  vocabulary: number;
  volume: number;
  operands: {
    distinct: number;
    total: number;
    identifiers: string[];
  };
  operators: {
    distinct: number;
    total: number;
    identifiers: string[];
  };
}

interface MethodAggregate {
  cyclomatic: number;
  cyclomaticDensity: number;
  halstead: HalsteadMetrics;
  params: number;
  sloc: {
    logical: number;
    physical: number;
  };
}

interface Complexity {
  methodAggregate: MethodAggregate;
  module: string;
  maintainability: number;
}

interface Report {
  info: {
    file: string;
    fileShort: string;
    fileSafe: string;
    link: string;
  };
  jshint: {
    messages: number;
  };
  complexity: Complexity;
}

interface ReportData {
  summary: {
    total: {
      jshint: number;
      sloc: number;
      maintainability: number;
    };
    average: {
      sloc: number;
      maintainability: string;
      jshint: string;
    };
  };
  reports: Report[];
}

// 使用 fetch 获取 JSON 数据
fetch('report.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data: ReportData) => {
    // 提取数据
    const fileNames: string[] = data.reports.map((report) => report.info.fileShort);
    const maintainabilityScores: number[] = data.reports.map((report) => report.complexity.maintainability);
    const cyclomaticComplexities: number[] = data.reports.map((report) => report.complexity.methodAggregate.cyclomatic);
    const halsteadVolumes: number[] = data.reports.map((report) => report.complexity.methodAggregate.halstead.volume);
    const logicalLines: number[] = data.reports.map((report) => report.complexity.methodAggregate.sloc.logical);
    const difficulties: number[] = data.reports.map((report) => report.complexity.methodAggregate.halstead.difficulty);
    // 创建图表
    function createChart(ctx: CanvasRenderingContext2D, labels: string[], data: number[], label: string): void {
      const Color = randomColor();
      // @ts-ignore
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: data,
              backgroundColor: Color,
              borderColor: Color,
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
          }
        }
      });
    }

    // 创建可维护性得分图表
    const maintainabilityEle = <HTMLCanvasElement>document.getElementById('maintainability');
    const ctxMaintainability = maintainabilityEle.getContext('2d') as CanvasRenderingContext2D;
    createChart(ctxMaintainability, fileNames, maintainabilityScores, 'Maintainability Scores');

    // 创建圈复杂度图表
    const cyclomaticComplexitiesEle = <HTMLCanvasElement>document.getElementById('cyclomaticComplexities');
    const ctxCyclomaticComplexities = cyclomaticComplexitiesEle.getContext('2d') as CanvasRenderingContext2D;
    createChart(ctxCyclomaticComplexities, fileNames, cyclomaticComplexities, 'Cyclomatic Complexity');

    // 创建Halstead 体积图表
    const halsteadVolumesEle = <HTMLCanvasElement>document.getElementById('halsteadVolumes');
    const ctxHalsteadVolumes = halsteadVolumesEle.getContext('2d') as CanvasRenderingContext2D;
    createChart(ctxHalsteadVolumes, fileNames, halsteadVolumes, 'Halstead Volume');

    // 创建逻辑行数图表
    const logicalLinesEle = <HTMLCanvasElement>document.getElementById('logicalLines');
    const ctxlogicalLines = logicalLinesEle.getContext('2d') as CanvasRenderingContext2D;
    createChart(ctxlogicalLines, fileNames, logicalLines, 'Logical Lines of Code');

    // // 创建difficulty图表
    // const difficultiesEle = <HTMLCanvasElement>document.getElementById('difficulties');
    // const ctxDifficulties = difficultiesEle.getContext('2d') as CanvasRenderingContext2D;
    // createChart(ctxDifficulties, fileNames, halsteadVolumes, 'difficulties');
  })
  .catch((error) => {
    console.error('Failed to fetch the report.json file:', error);
  });
export {};
