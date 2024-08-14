// 在代码质量和复杂度分析中，Plato（以及其他类似工具）提供了多种指标。这些指标帮助开发人员理解代码的复杂性、可维护性以及潜在问题。在大数据和软件工程的背景下，以下四个指标通常被认为是最为重要的
// 1. Maintainability Index（可维护性指数）
// 原因:

// 综合性: 可维护性指数（Maintainability Index）是一个综合性指标，结合了代码复杂度、代码行数和注释比率等因素来评估代码的可维护性。它给出了一个易于理解的得分（通常在 0 到 100 之间），帮助开发人员快速评估整个代码库的健康状况。
// 长期影响: 维护性高的代码通常更容易理解、修改和扩展，对于长期项目和大规模系统尤其重要。随着时间的推移，维护性低的代码会导致技术债务增加，增加维护成本和风险。
// 2. Cyclomatic Complexity（圈复杂度）
// 原因:

// 逻辑复杂度: 圈复杂度直接反映了代码中决策逻辑的复杂性。较高的圈复杂度意味着代码具有更多的分支和条件逻辑，从而增加了测试和维护的难度。
// 错误风险: 大量研究表明，圈复杂度较高的代码段更容易引入错误。通过监控圈复杂度，可以帮助开发团队识别出潜在的高风险区域并采取措施（如代码重构）来降低风险。
// 3. Halstead Volume（Halstead 体积）
// 原因:

// 认知负担: Halstead 体积衡量了代码的信息量或复杂性，从认知角度评估理解和维护代码所需的工作量。体积越大，表示代码包含的信息越多，开发人员需要更多的时间和精力来理解和处理这些代码。
// 复杂性管理: 在大规模系统中，理解和管理复杂性是一个关键挑战。Halstead 体积提供了一个量化复杂性的途径，使得开发团队能够识别出那些可能需要简化或优化的部分。
// 4. Logical Lines of Code（逻辑代码行数）
// 原因:

// 代码规模: 逻辑代码行数是代码规模的一个直接衡量指标。虽然行数本身并不总是与复杂性直接相关，但在大数据和复杂系统中，较高的代码行数通常意味着更多的功能、更复杂的逻辑，可能需要更多的测试和维护工作。
// 效率和性能: 大量的代码行数也可能影响系统的性能和效率。通过监控逻辑代码行数，开发团队可以识别出哪些部分可能过于冗长或复杂，并进行相应的优化。
// 综合考虑
// 在大数据环境下，代码质量的管理尤为重要，因为代码规模和复杂性往往远高于普通项目。这四个指标（Maintainability Index、Cyclomatic Complexity、Halstead Volume 和 Logical Lines of Code）各自从不同角度反映了代码的质量和复杂性：

// Maintainability Index 提供了一个整体的代码健康状况概览，帮助团队长期管理技术债务。
// Cyclomatic Complexity 专注于代码的逻辑复杂度，帮助开发人员识别高风险的逻辑分支。
// Halstead Volume 则从信息论的角度量化了代码的复杂性，强调理解和处理代码的认知负担。
// Logical Lines of Code 则提供了代码规模的一个基础度量，提醒团队注意代码规模对维护和性能的潜在影响。

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
fetch('/report')
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
