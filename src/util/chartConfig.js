import * as echarts from "echarts";

export function gaugeChartOption(name, value) {
  return {
    series: [
      {
        name: name,
        type: 'gauge',

        // 3) progress 在 axisLine 外侧 + 发光蓝
        progress: {
          show: true,
          roundCap: true,
          width: 4, // 比 axisLine.width 大一点 => 看起来在外侧
          itemStyle: {
            color: '#0093ff',
            shadowBlur: 12,
            shadowColor: 'rgba(123,255,251,0.85)',
            shadowOffsetX: 0,
            shadowOffsetY: 0
          }
        },
        splitNumber: 4,
        splitLine: {
          show: false,
          // 贴在 axisLine 内侧：负值
          distance: 0,         // 约等于 axisLine.width
          length: 3,
          lineStyle: {
            width: 1,
            color: '#000'
          }
        },

        axisTick: { show: false },

        // 2) 刻度文字更小 + 更贴近轴线
        axisLabel: {
          show: false,
          fontSize: 10,
          distance: 10, // 越小越贴近轴线（可再调到 4/2）
        },

        axisLine: {
          show: true,
          roundCap: true,
          lineStyle: {
            width: 2,
            color: [
              [
                1,
                new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#22c55e' },
                  { offset: 0.5, color: '#facc15' },
                  { offset: 1, color: '#ef4444' }
                ])
              ]
            ]
          }
        },



        // 1) 指针改“线条形状”
        pointer: {
          show: true,
          // 细长矩形 path（中心向外指）
          icon: 'path://M-1,-6 L1,-6 L1,-70 L-1,-70 Z',
          width: 2,          // 影响 icon 的缩放参考
          length: '60%',     // 仍保留（部分版本会参考 length/width）
          itemStyle: {
            color: '#111'
          }
        },

        data: [{ value: value }],
        detail: {
          show: false,
          valueAnimation: true,
          formatter: '{value}',
          fontSize: 16,          // 👈 调小（原来默认一般 18~20）
          fontWeight: 500,
          color: '#2a66ff',      // 👈 改成你想要的颜色
          offsetCenter: [0, '45%']  // 👈 控制上下位置（往下移动）
        },
      }
    ]
  }
}

export function lineChartOption(name, lastcheck, avgdelay, losspk) {
  return {
    title: { text: name },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      top: '20%',
      data: ['AvgDelay', 'LossPack'],
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '3%',
      top: '30%',
      containLabel: true
    },
    xAxis: {
      data: lastcheck
    },
    yAxis: [
      {
        type: 'value',
        name: 'Delay',
        position: 'left'
      },
      {
        type: 'value',
        name: 'LossPack',
        min: 0,
        max: 100,
        position: 'right',
        axisLabel: {
          formatter: '{value} %'
        }
      }
    ],
    series: [
      {
        name: 'AvgDelay',
        type: 'line',
        itemStyle: {
          normal: {
            color : '#00CC66'
          }
        },
        symbolSize: 0, //折线点的大小
        animation: false,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#00CC66" }, //从上往下的渐变
              { offset: 1, color: "#00CC6600" },
            ]),
          }
        },
        lineStyle: {
          shadowColor: "#47ffa3", //透明的颜色
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1, //透明度
          shadowBlur: 8, //阴影大小
          type: "solid", //实线
          width: 2,
        },
        data: avgdelay
      },
      {
        name: 'LossPack',
        type: 'line',
        yAxisIndex: 1,
        itemStyle: {
          normal: {
            color : '#f8450f'
          }
        },
        animation: false,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#f8450f" }, //从上往下的渐变
              { offset: 1, color: "#f8450f00" },
            ]),
          }
        },
        lineStyle: {
          shadowColor: "#ff7247", //透明的颜色
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1, //透明度
          shadowBlur: 8, //阴影大小
          type: "solid", //实线
          width: 2,
        },
        data: losspk
      }
    ]
  };
}
