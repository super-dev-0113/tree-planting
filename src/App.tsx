import React, { useState, useEffect } from "react";
const ReactHighcharts = require("react-highcharts/ReactHighstock.src")

const App = () => {
    const [data, setData] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getStartThreshold = (startTimestamp: any) => {
      let startDate: any = new Date(startTimestamp);
      console.log(startDate.toUTCString());
      const offset = startDate.getTimezoneOffset();
        let start_h = startDate.getHours();
        let start_m = start_h*60 + startDate.getMinutes();
        let start_s = start_m*60 + startDate.getSeconds(); 
        if (start_s + Math.abs(offset*60) > 24*3600) { 
          startDate.setDate(startDate.getDate() + 1);
        }
        startDate.setHours(0, 0, 0);
        return (Date.parse(startDate) - offset*60000)
    }
    const fetchData = () => {
    fetch('https://x.api.ecologi.com/trees')
      .then((response) => response.json())
      .then((data) => {

        data.data.sort(function(a: Array<any>, b: Array<any>){return a[1] - b[1]});
        let startThresold = getStartThreshold(data.data[0][1]*1000);

        let processedData: Array<any> =[]; 
        let tem = data.data[0][0];
        let timestamp = startThresold;
        for(let i=1; i<data.data.length; i++)
        {
          if(data.data[i][1]*1000 < timestamp){
            tem += data.data[i][0]*1000;
          }
          else{
            processedData.push([timestamp - 24*3600*1000, tem]);
            tem = data.data[i][0]*1000;
            timestamp += 24*3600*1000;
            }
        }
        
        setData(processedData);
        console.log(processedData)
        setIsLoading(false);  
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
      
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (isLoading) {
    return <div>Loading...</div>;
  }

    const configPrice = {
    
      tooltip: {
        shared: true
      },
      plotOptions: {
        series: {
          showInNavigator: true,
          gapSize: 6,
          showInLegend: true,
          visible: true,
        },
        area: {
          fillColor: {
             linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1}
          },
          marker: {
             radius: 2
          },
          lineWidth: 1,
          states: {
             hover: {
                lineWidth: 1
             }
          },
          threshold: null
       }
      },
      title: {
        text: `Trees Per Day(GMT)`
      },
      chart: {
        height: 700,
        zoomType: 'x'
      },
      xAxis: {
        type: "date"
      },
      rangeSelector: {
        buttons: [
          {
            type: "day",
            count: 7,
            text: "7d"
          },
          {
            type: "month",
            count: 1,
            text: "1m"
          },
          {
            type: "month",
            count: 3,
            text: "3m"
          },
          {
            type: "all",
            text: "All"
          }
        ],
        selected: 3
      },
      
      series: [
        {
          name: "Trees",
          type: "line",
          data: data,
        }
      ]
    };
    return (
      <div>
        <ReactHighcharts config={configPrice}></ReactHighcharts>
      </div>
    );
}
export default App;
