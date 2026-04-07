import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopBar from "../components/TopBar";

describe("TopBar", () => {
    const renderComponent = () =>
        render(
            <MemoryRouter>
                <TopBar />
            </MemoryRouter>
        );

    it("renders without crashing", () => {
        renderComponent();
        expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("links to /home", () => {
        renderComponent();
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/home");
    });

    it("renders both images with correct alt text", () => {
        renderComponent();

        const icon = screen.getByAltText("clean stream icon");
        const slogan = screen.getByAltText(
            "clean stream laundry solutions slogan"
        );

        expect(icon).toBeInTheDocument();
        expect(slogan).toBeInTheDocument();
    });

    it("renders image sources correctly", () => {
        renderComponent();

        const images = screen.getAllByRole("img");

        expect(images[0]).toHaveAttribute("src", "\\src\\assets\\Icon.png");
        expect(images[1]).toHaveAttribute("src", "\\src\\assets\\Slogan.png");
    });
});