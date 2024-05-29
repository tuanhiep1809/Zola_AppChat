import styled from "@emotion/styled";

const StyledButton = styled.button`
  ${({
    hidden,
    width,
    bgColor,
    disabled,
    border,
    borderRadius,
    bgColorHover,
    margin,
    padding,
    color,
    size,
    weight,
  }) => `
  display: ${hidden ? "none" : "flex"};
  align-items: center;
  width: ${width};
  color: ${color};
  font-size: ${size};
  font-weight: ${weight};
  padding: ${padding};
  margin: ${margin};
  border: none;
  border: ${border};
  background-color: ${bgColor};
  opacity: ${disabled ? 0.2 : 1};
  border-radius: ${borderRadius};
  &:hover {
    background-color: ${bgColorHover};
  }
  cursor: pointer;
`}
`;

export default function Button(props) {
  const {
    children,
    width = "auto",
    type = "button",
    bgColor = "white",
    bgColorHover = "#EAEDF0",
    borderRadius = "5px",
    margin = "4px",
    padding = "4px 6px",
    size = "16px",
    weight = "400",
    onClick,
    disabled = false,
    color = "text-white",
    border = "",
    className = "",
    hidden = false,
  } = props;

  return (
    <StyledButton
      className={className}
      width={width}
      type={type}
      bgColor={bgColor}
      bgColorHover={bgColorHover}
      disabled={disabled}
      border={border}
      borderRadius={borderRadius}
      margin={margin}
      padding={padding}
      color={color}
      size={size}
      weight={weight}
      onClick={onClick}
      hidden={hidden ? "hidden" : ""}
    >
      {children}
    </StyledButton>
  );
}
