// Chart 6.2
import React from "react";
import Plot from "react-plotly.js";

type ContourPlotProps = {
  surfaceData: number[][];
  param1Values: number[];
  param2Values: number[];
};

const ContourPlot: React.FC<ContourPlotProps> = ({ surfaceData, param1Values, param2Values }) => {
  return (
    <Plot
      data={[{
        z: surfaceData,
        x: param1Values,
        y: param2Values,
        type: 'contour',
        colorscale: 'Viridis'
      }]}
      layout={{
        title: 'Contour Plot',
        xaxis: { title: 'Param 1' },
        yaxis: { title: 'Param 2' }
      }}
    />
  );
};

export default ContourPlot;
