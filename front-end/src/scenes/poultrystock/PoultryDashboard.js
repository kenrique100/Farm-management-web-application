import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { SpinnerLoading } from "../../components/utilities/SpinnerLoading";
import { PoultryApi } from "../../components/misc/PoultryApi";
import AddFlockDialog from "./AddFlockDialog";

const initialValue = {
  flockName: "",
  nbrOfBirds: "",
  avgWeight: "",
  purpose: "",
  reduction: "",
  flockType: "",
  stockDate: "",
  mortality: "",
  batch: "",
};

export const PoultryDashboard = () => {
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState([]); // Set rowData to Array of Objects, one Object per Row
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [httpError, setHttpError] = useState(null);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    getPoultry();
    setIsLoading(false);
  }, []);
  const getPoultry = () => {
    PoultryApi.getAllFlocks(user)
      .then((response) => {
        setRowData(response.data);
      })
      .catch((err) => {
        setIsLoading(false);
        setHttpError(err.message + " : Contact Support or Try again later ! ");
      });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialValue);
  };
  let navigate = useNavigate();
  const routeChange = (value) => {
    let url = "/flockDetails";
    let path =
      url +
      `/${value.flockId}` +
      `/${value.flockType}` +
      `/${value.stockRemaining}` +
      `/${value.nbrOfDays}` +
      `/${value.reduction}` +
      `/${value.mortality}` +
      `/${value.stockDate}` +
      `/${value.purpose}`;

    navigate(path);
  };

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    { field: "flockId" },
    { headerName: "Breed", field: "flockType" },
    { field: "stockDate", hide: true },
    { headerName: "Stock", field: "nbrOfBirds" },
    { field: "purpose", hide: true },
    { headerName: "Reduction", field: "reduction" },
    { field: "mortality" },
    { headerName: "Remaining", field: "stockRemaining" },
    { field: "soldOut", hide: true },
    {
      headerName: "Actions",
      field: "flockId",
      filter: false,
      flex: 3,
      cellRenderer: (params) => (
        <div>
          <Tooltip title="Update">
            <Button
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => handleUpdate(params.data)}
            ></Button>
          </Tooltip>
          <Tooltip title="View Detail Records">
            <Button
              color="secondary"
              startIcon={<GridViewIcon />}
              onClick={() => routeChange(params.data)}
            ></Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => handleDelete(params.value)}
            ></Button>
          </Tooltip>
        </div>
      ),
    },
  ]);

  const handleFormSubmit = () => {
    if (formData.id) {
      //updating a stock
      const confirm = window.confirm(
        "Are you sure, you want to update this row ?"
      );
      confirm &&
        PoultryApi.updateFlock(user, formData.id, formData)
          .then(() => {
            handleClose();
            getPoultry();
          })
          .catch((err) => {
            setIsLoading(false);
            setHttpError(
              err.response.data.status +
                " : " +
                err.response.data.message +
                " : Refresh to try again or contact support if you believe this is an error that cannot be solved!  "
            );
          });
    } else {
      PoultryApi.createFlock(user, formData)
        .then((response) => {
          handleClose();
          getPoultry();
        })

        .catch((err) => {
          setIsLoading(false);
          setHttpError(
            err.response.data.status +
              " : " +
              err.response.data.message +
              " : Refresh to try again or contact support if you believe this is an error that cannot be solved!  "
          );
        });
    }
  };
  // setting update row data to form data and opening pop up window
  const handleUpdate = (oldData) => {
    setFormData(oldData);
    handleClickOpen();
  };

  //deleting a stock
  const handleDelete = (id) => {
    const confirm = window.confirm(
      "Are you sure, you want to delete this stock ?",
      id
    );
    if (confirm) {
      PoultryApi.deleteFlock(user, id)
        .then(() => {
          getPoultry();
          // refresh()
        })
        .catch((err) => {
          setIsLoading(false);
          setHttpError(
            err.response.data.status +
              " : " +
              err.response.data.message +
              " : Refresh to try again or contact support if you believe this is an error that cannot be solved!  "
          );
        });
    }
  };
  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => ({
    sortable: true,
    floatingFilter: true,
    filter: true,
    flex: 2,
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log("cellClicked", event);
  }, []);

  // Example using Grid's API
  const buttonListener = useCallback((e) => {
    gridRef.current.api.exportDataAsCsv();
  }, []);
  const onChange = (e) => {
    const { value, id } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  if (isLoading) {
    return <SpinnerLoading />;
  }

  if (httpError) {
    return (
      <div className="container m-5">
        {httpError && (
          <h5 className=" text-danger  d-flex justify-content-center">
            {" "}
            {httpError}{" "}
          </h5>
        )}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* <!-- Page Heading --> */}
      <h1 className="h3 mb-2 text-gray-800"></h1>
      <p className="mb-4"> ANIMAL PRODUCTION</p>

      {/* <!-- Begin Page Content --> */}
      {/* <CardMenu stockData={stockData} /> */}
      <div className="container-fluid">
        {/* <!-- DataTales Example --> */}
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">
              {" "}
              Kombe Animal Farm Stock Report
            </h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              {/* Example using Grid's API */}
              <Button
                variant="outlined"
                onClick={handleClickOpen}
                startIcon={<AddOutlinedIcon />}
              >
                Add New Flock
              </Button>

              {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
              <div
                className="ag-theme-alpine"
                style={{ width: "100%", height: 400 }}
              >
                <AgGridReact
                  ref={gridRef} // Ref for accessing Grid's API
                  rowData={rowData} // Row Data for Rows
                  columnDefs={columnDefs} // Column Defs for Columns
                  defaultColDef={defaultColDef} // Default Column Properties
                  animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                  rowSelection="multiple" // Options - allows click selection of rows
                  enableBrowserTooltips={true}
                  pagination={true}
                  onCellClicked={cellClickedListener} // Optional - registering for Grid Event
                />
              </div>
              <Button
                align="right"
                variant="outlined"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={buttonListener}
              >
                Export
              </Button>

              <AddFlockDialog
                open={open}
                handleClose={handleClose}
                data={formData}
                onChange={onChange}
                handleFormSubmit={handleFormSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
