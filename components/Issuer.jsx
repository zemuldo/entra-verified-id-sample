import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";

export default function Issuer() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [qrCodeScanned, setQRCodeScanned] = React.useState(false);
  const [issuanceStatus, setIssuanceStatus] = React.useState(null);
  const [respIssuanceReq, setRespIssuanceReq] = React.useState(null);

  React.useEffect(() => {
    if (!respIssuanceReq) return;
    var checkStatus = setInterval(function () {
      fetch(
        "/api/issuer/issuance-response?id=" +
          respIssuanceReq.id
      )
        .then((response) => response.text())
        .then((response) => {
          if (response.length > 0) {
            const respMsg = JSON.parse(response);
            if (respMsg.status === "request_retrieved") {
              setQRCodeScanned(true);
              setIssuanceStatus("request_retrieved");
            }
            if (respMsg.status === "issuance_successful") {
              setQRCodeScanned(true);
              setIssuanceStatus("issuance_successful");
              clearInterval(checkStatus);
            }
            if (respMsg.status === "issuance_error") {
                setIssuanceStatus("issuance_error");
                setError(respMsg.message);
              clearInterval(checkStatus);
            }
          }
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }, 2500);

    return () => clearInterval(checkStatus);
  }, [respIssuanceReq]);

  React.useEffect(() => {
    fetch("/api/issuer/issuance-request")
      .then(async (response) => {
        const message = await response.text();
        const _respIssuanceReq = JSON.parse(message);
        setRespIssuanceReq(_respIssuanceReq);
        if (/Android/i.test(navigator.userAgent)) {
          window.location.href = _respIssuanceReq.url;
          setTimeout(function () {
            window.location.href =
              "https://play.google.com/store/apps/details?id=com.azure.authenticator";
          }, 2000);
        } else if (/iPhone/i.test(navigator.userAgent)) {
          window.location.replace(_respIssuanceReq.url);
        } else {
          if (response.status > 299) {
            setError(message);
          } else {
            console.log(
              `Not Android or IOS. Generating QR code encoded with ${message}`
            );
          }
        }
         setLoading(false);
      })
      .catch((error) => {
         setLoading(false);
        console.log(error.message);
      });
  }, []);

  return (
    <>
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        Issue VC
      </Typography>

      {issuanceStatus === "issuance_successful" && (
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
        >
          Credential issuance success
        </Typography>
      )}
      {issuanceStatus === "issuance_error" && (
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
        >
          Credential issuance failed due to error {error}
        </Typography>
      )}

      {(!issuanceStatus || issuanceStatus === "request_retrieved") && (
        <>
          {loading && (
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              Intializing... Please wait :)
            </Typography>
          )}
          {!loading && (
            <>
              {" "}
              <Typography
                variant="h5"
                align="center"
                color="text.secondary"
                paragraph
              >
                Scan the QR code below to continue {issuanceStatus}
              </Typography>
              <Stack
                sx={{ pt: 4 }}
                direction="row"
                spacing={2}
                justifyContent="center"
              >
                {respIssuanceReq && (
                  <div style={{ opacity: qrCodeScanned ? 0.2 : 1 }}>
                    <QRCodeSVG value={respIssuanceReq.url} />
                  </div>
                )}
                {respIssuanceReq?.pin && <span>{respIssuanceReq.pin}</span>}
              </Stack>
              <Stack
                sx={{ pt: 4 }}
                direction="row"
                spacing={2}
                justifyContent="center"
              >
                {qrCodeScanned && (
                  <p>
                    Scanned QR proceede on the authenticator to get your
                    credential.
                  </p>
                )}
              </Stack>{" "}
            </>
          )}
        </>
      )}
    </>
  );
}
