//  import React from 'react'
// import { Link } from 'react-router-dom'

// export default function Button({locationHref,extraCss, btnName, bgColour,textColour, hoverBgColour, fontTextStyle, children}) {
//   return (
//     <Link to={locationHref}>
//         <button  className={`${extraCss} ${bgColour} ${textColour} ${fontTextStyle} ${hoverBgColour}`}>
//             {btnName}
//             {children}
//         </button> 
//     </Link>

//   )
// }
import React from "react";
import { Link } from "react-router-dom";

export default function Button({
  locationHref,
  extraCss,
  btnName,
  bgColour,
  textColour,
  hoverBgColour,
  fontTextStyle,
  children,
  onClick,
  type = "button",
}) {
  const classes = `${extraCss} ${bgColour} ${textColour} ${fontTextStyle} ${hoverBgColour}`;

  // 👉 If link is provided, render Link
  if (locationHref) {
    return (
      <Link to={locationHref} className="inline-block">
        <span className={classes}>
          {children}
          {btnName}
        </span>
      </Link>
    );
  }

  // 👉 Otherwise render button
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {btnName}
    </button>
  );
}
