import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#07111f",
          color: "#fffdf8",
          display: "flex",
          fontSize: 26,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.04em",
          position: "relative",
          width: "100%",
        }}
      >
        <span
          style={{
            background: "#b8642a",
            bottom: 0,
            display: "flex",
            left: 0,
            position: "absolute",
            top: 0,
            width: 7,
          }}
        />
        TS
      </div>
    ),
    size
  );
}
