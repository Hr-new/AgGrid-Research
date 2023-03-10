import React, { useState, useMemo, useCallback, useRef } from "react";
import { read, utils, writeFile } from "xlsx";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { DateRenderer, DEFAULT_DATE_FORMAT, formatDate } from "../utills";
import TextField from "@mui/material/TextField";
import ReactDOM from "react-dom";
import { useSnackbar } from "notistack";
import { Button } from "@mui/material";

const GridLayout = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [gridApi, setGridAppi] = useState<keyable>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const gridRef: any = useRef();

  interface keyable {
    [value: string]: any;
    [current: symbol]: any;
  }
  interface currentObject {
    [key: string]: any;
  }

  const getDatePicker = () => {
    function Datepicker() {}
    Datepicker.prototype.init = function (params: keyable) {
      const fillZeros = (a: Number) => {
        return Number(a) < 10 ? "0" + a : a;
      };
      const getFormatedDate = (dateString: moment.MomentInput) => {
        let formatedDate: String | null = "";
        if (dateString) {
          formatedDate = formatDate(dateString, DEFAULT_DATE_FORMAT);
        }
        let dateParse: keyable;
        let dd, mm, yyyy;
        if (formatedDate !== null) {
          dateParse = new Date(
            formatedDate.split("/")[0] +
              "-" +
              formatedDate.split("/")[1] +
              "-" +
              formatedDate.split("/")[2]
          );
          dd = dateParse.getDate();
          mm = dateParse.getMonth() + 1; //January is 0!
          yyyy = dateParse.getFullYear();
        }

        return yyyy + "-" + fillZeros(mm) + "-" + fillZeros(dd);
      };
      this.textInput = React.createRef();
      const eInput = (
        <TextField
          type={"date"}
          defaultValue={getFormatedDate(params.value)}
          ref={this.textInput}
        />
      );
      this.div = document.createElement("div");
      this.div.className = "ag-cell-parent-append";
      ReactDOM.render(eInput, this.div);
    };
    Datepicker.prototype.getGui = function () {
      return this.div;
    };
    Datepicker.prototype.afterGuiAttached = function () {
      this.textInput.current?.focus();
    };
    Datepicker.prototype.getValue = function () {
      return this.textInput.current?.querySelector("input").value;
    };
    Datepicker.prototype.destroy = function () {};
    Datepicker.prototype.isPopup = function () {
      return false;
    };
    return Datepicker;
  };

  const components = { datePicker: getDatePicker() };
  const handleEdit = (data: keyable) => {
    const variant = "success";
    enqueueSnackbar(data.id, {
      variant,
      autoHideDuration: 2000,
      anchorOrigin: { horizontal: "center", vertical: "top" },
    });
  };

  interface params {
    [data: string]: any;
  }

  const getActionButton = (params: params) => {
    return (
      <Button variant="contained" onClick={() => handleEdit(params.data)}>
        Edit
      </Button>
    );
  };

  const [columnDefs] = useState([
    // { field: "id", checkboxSelection: true, headerCheckboxSelection: true },
    {
      field: "athlete",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Porsche", "Toyota", "Ford", "AAA", "BBB", "CCC"],
      },
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    {
      field: "date",
      cellRenderer: DateRenderer,
      cellEditor: "datePicker",
    },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" },
    { field: "action", cellRenderer: getActionButton },
  ]);

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      editable: true,
      resizable: true,
    };
  }, []);

  interface eventObject {
    [target: string]: any;
  }
  const handleImport = ($event: eventObject) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event: eventObject) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows: any[] = utils.sheet_to_json(wb.Sheets[sheets[0]], {
            raw: false,
          });
          setRowData(rows);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const headings = [
      [
        "id",
        "athlete",
        "age",
        "country",
        "year",
        "date",
        "sport",
        "gold",
        "silver",
        "bronze",
        "total",
      ],
    ];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    const selectedData = gridApi?.getSelectedRows();
    if (selectedData.length > 0) {
      utils.sheet_add_json(ws, selectedData, {
        origin: "A2",
        skipHeader: true,
      });
      utils.book_append_sheet(wb, ws, "Sample Data");
      writeFile(wb, "Olympic Data.xlsx");
    } else {
      const variant = "warning";
      enqueueSnackbar("Select row to export.", {
        variant,
        action: (key) => (
          <>
            <Button
              size="small"
              onClick={() =>
                alert(`Select the atleast 1 row to perform Export Operation`)
              }
            >
              Detail
            </Button>
            <Button size="small" onClick={() => closeSnackbar(key)}>
              Dismiss
            </Button>
          </>
        ),
        anchorOrigin: { horizontal: "center", vertical: "top" },
      });
    }
  };

  const onGridReady = (params: keyable) => {
    setGridAppi(params.api);
  };

  // const createNewRowData = () => {
  //   const newData = {
  //     athlete: "athlete",
  //     age: "age",
  //     country: "country",
  //     year: "year",
  //     date: "date",
  //     sport: "sport",
  //     gold: "gold",
  //     silver: "silver",
  //     bronze: "bronze",
  //     total: "total",
  //   };
  //   return newData;
  // };

  // Function for add item at the end of grid
  // eslint-disable-next-line no-unused-vars
  // const addItems = useCallback((addIndex) => {
  //   const newItems = [createNewRowData()];
  //   gridRef.current.api.applyTransaction({
  //     add: newItems,
  //     addIndex: addIndex,
  //   });
  // }, []);

  // Add extra row at the end
  const processDataFromClipboard = useCallback((params: keyable) => {
    const data = [...params.data];
    const emptyLastRow =
      data[data.length - 1][0] === "" && data[data.length - 1].length === 1;
    if (emptyLastRow) {
      data.splice(data.length - 1, 1);
    }
    const lastIndex = gridRef.current.api.getModel().getRowCount() - 1;
    const focusedCell = gridRef.current.api.getFocusedCell();
    const focusedIndex = focusedCell.rowIndex;
    if (focusedIndex + data.length - 1 > lastIndex) {
      const resultLastIndex = focusedIndex + (data.length - 1);
      const numRowsToAdd = resultLastIndex - lastIndex;
      const rowsToAdd = [];
      for (let i = 0; i < numRowsToAdd; i++) {
        const index = data.length - 1;
        const row = data.slice(index, index + 1)[0];
        // Create row object
        const rowObject: keyable = {};
        let currentColumn: currentObject = focusedCell.column;
        row.forEach((item: keyable) => {
          if (!currentColumn) {
            return;
          }
          rowObject[currentColumn.colDef.field] = item;
          currentColumn =
            gridRef.current?.columnApi.getDisplayedColAfter(currentColumn);
        });
        rowsToAdd.push(rowObject);
      }
      gridRef.current.api.applyTransaction({ add: rowsToAdd });
    }
    return data;
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 450, width: "100%" }}>
      <input
        type="file"
        name="file"
        className="custom-file-input"
        id="inputGroupFile"
        required
        onChange={handleImport}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <button
        onClick={handleExport}
        className="btn btn-primary float-right"
        disabled={rowData.length > 0 ? false : true}
      >
        Export <i className="fa fa-download"></i>
      </button>
      {/* <button onClick={() => addItems(undefined)}>Add Items</button> */}
      <AgGridReact
        rowData={rowData}
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={"multiple"}
        onGridReady={onGridReady}
        components={components}
        enableRangeSelection={true}
        processDataFromClipboard={processDataFromClipboard}
        suppressRowClickSelection={true}
      ></AgGridReact>
    </div>
  );
};

export default GridLayout;
