// Chart 6.1
import React from "react";
import Plot from "react-plotly.js";

type SurfacePlotProps = {
  surfaceData: number[][];
  param1Values: number[];
  param2Values: number[];
};

const SurfacePlot: React.FC<SurfacePlotProps> = ({ surfaceData, param1Values, param2Values }) => {
  return (
    <Plot
      data={[{
        z: surfaceData,
        x: param1Values,
        y: param2Values,
        type: 'surface'
      }]}
      layout={{
        title: '3D Surface Plot',
        scene: {
          xaxis: { title: 'Param 1' },
          yaxis: { title: 'Param 2' },
          zaxis: { title: 'Quantity' }
        }
      }}
    />
  );
};

export default SurfacePlot;
